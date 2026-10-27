/**
 * HAOMI Studio — Sairi Payment Gateway Client Controller
 * Endpoint Configuration:
 *   SAIRI_API_BASE = https://api.sairibot.my.id/api
 *   SAIRI_API_KEY  = SKY_39575737d3d744d8
 *
 * Supported Actions:
 *   - /balance?apikey=...
 *   - /invoice?apikey=...&amount=...
 *   - /invoice/status?apikey=...&invoice_id=...
 */

(function (window) {
  'use strict';

  const DEFAULT_CONFIG = {
    apiBase: '/api/sairi',
    directApiBase: 'https://api.sairibot.my.id/api',
    apiKey: 'SKY_39575737d3d744d8'
  };

  class SairiPaymentGateway {
    constructor(config) {
      this.config = Object.assign({}, DEFAULT_CONFIG, config || {});
    }

    async getBalance() {
      try {
        const res = await fetch(`${this.config.apiBase}?action=balance`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
      } catch (err) {
        console.warn('Proxy balance failed, trying direct:', err);
        const url = `${this.config.directApiBase}/balance?apikey=${encodeURIComponent(this.config.apiKey)}`;
        const directRes = await fetch(url);
        return await directRes.json();
      }
    }

    async createInvoice(amount) {
      if (!amount || amount < 100) {
        throw new Error('Nominal transaksi minimal Rp 100');
      }
      try {
        const res = await fetch(`${this.config.apiBase}?action=invoice&amount=${encodeURIComponent(amount)}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
      } catch (err) {
        console.warn('Proxy invoice creation failed, trying direct:', err);
        const url = `${this.config.directApiBase}/invoice?apikey=${encodeURIComponent(this.config.apiKey)}&amount=${encodeURIComponent(amount)}`;
        const directRes = await fetch(url);
        return await directRes.json();
      }
    }

    async checkStatus(invoiceId) {
      if (!invoiceId) throw new Error('invoice_id wajib diisi');
      try {
        const res = await fetch(`${this.config.apiBase}?action=status&invoice_id=${encodeURIComponent(invoiceId)}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
      } catch (err) {
        console.warn('Proxy status check failed, trying direct:', err);
        const url = `${this.config.directApiBase}/invoice/status?apikey=${encodeURIComponent(this.config.apiKey)}&invoice_id=${encodeURIComponent(invoiceId)}`;
        const directRes = await fetch(url);
        return await directRes.json();
      }
    }

    renderModal(invoiceData, onComplete) {
      let modal = document.getElementById('sairi-pay-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'sairi-pay-modal';
        modal.className = 'modal-backdrop';
        modal.innerHTML = `
          <div class="modal-dialog" style="max-width:420px;text-align:center;padding:24px;">
            <h3 style="margin-top:0;font-size:18px;font-weight:700;">Pembayaran QRIS</h3>
            <p style="font-size:13px;color:#888;margin-bottom:16px;">Scan kode QRIS di bawah menggunakan GoPay, OVO, Dana, ShopeePay, atau Mobile Banking.</p>
            <div id="sairi-qr-container" style="background:#fff;padding:16px;border-radius:12px;display:inline-block;margin-bottom:16px;">
              <img id="sairi-qr-img" src="" alt="QRIS" style="width:220px;height:220px;display:block;" />
            </div>
            <div style="font-size:16px;font-weight:bold;margin-bottom:8px;" id="sairi-amount-text">Rp 0</div>
            <div style="font-size:12px;color:#666;" id="sairi-status-text">Menunggu pembayaran...</div>
            <div style="margin-top:20px;">
              <button type="button" class="btn btn-secondary" id="sairi-cancel-btn">Tutup</button>
            </div>
          </div>
        `;
        document.body.appendChild(modal);
      }

      const qrImg = modal.querySelector('#sairi-qr-img');
      const amountText = modal.querySelector('#sairi-amount-text');
      const statusText = modal.querySelector('#sairi-status-text');
      const cancelBtn = modal.querySelector('#sairi-cancel-btn');

      const qrUrl = invoiceData.qr_url || invoiceData.qr_image || (invoiceData.data && (invoiceData.data.qr_url || invoiceData.data.qr_image)) || '';
      const amount = invoiceData.amount || (invoiceData.data && invoiceData.data.amount) || 0;
      const invoiceId = invoiceData.invoice_id || (invoiceData.data && invoiceData.data.invoice_id) || '';

      qrImg.src = qrUrl;
      amountText.textContent = `Rp ${Number(amount).toLocaleString('id-ID')}`;
      modal.style.display = 'flex';

      let timer = null;
      const pollStatus = async () => {
        if (!invoiceId) return;
        try {
          const res = await this.checkStatus(invoiceId);
          const st = (res && res.status) || (res.data && res.data.status) || '';
          if (st === 'PAID' || st === 'success' || st === 'completed') {
            statusText.textContent = 'Pembayaran Berhasil! Terima kasih.';
            statusText.style.color = '#10b981';
            clearInterval(timer);
            if (typeof onComplete === 'function') onComplete(res);
            setTimeout(() => { modal.style.display = 'none'; }, 2500);
          }
        } catch (_) {}
      };

      if (invoiceId) {
        timer = setInterval(pollStatus, 3000);
      }

      cancelBtn.onclick = () => {
        if (timer) clearInterval(timer);
        modal.style.display = 'none';
      };
    }
  }

  window.SairiPaymentGateway = SairiPaymentGateway;
  window.sairiPay = new SairiPaymentGateway();

})(window);
