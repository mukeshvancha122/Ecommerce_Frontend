/**
 * Receipt Generator Utility
 * Generates professional PDF receipts with HyderNexa branding
 */

import pdfMake from 'pdfmake/build/pdfmake';

// Initialize pdfMake with fonts
// vfs_fonts.js exports vfs directly as module.exports = vfs;
try {
  const pdfFonts = require('pdfmake/build/vfs_fonts');
  // The vfs_fonts module exports the vfs object directly
  if (pdfFonts) {
    pdfMake.vfs = pdfFonts;
  }
} catch (error) {
  console.warn('Could not load pdfmake fonts:', error);
  // Create empty vfs to prevent errors
  pdfMake.vfs = pdfMake.vfs || {};
}

/**
 * Generate professional PDF receipt
 */
export const downloadReceiptPDF = async (orderData, currency = 'INR') => {
  try {
    // Get currency symbol
    const currencySymbols = {
      'INR': '₹',
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'AUD': 'A$',
      'CAD': 'C$'
    };
    const symbol = currencySymbols[currency] || currency;

    // Format currency helper
    const formatCurrency = (amount) => {
      if (typeof amount !== 'number') {
        amount = parseFloat(amount) || 0;
      }
      return `${symbol}${amount.toFixed(2)}`;
    };

    // Prepare order data
    const orderCode = orderData.order_code || orderData.orderId || `ORD-${Date.now()}`;
    const orderDate = orderData.order_date || orderData.placedAt || new Date();
    const formattedDate = new Date(orderDate).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const items = orderData.item || orderData.items || [];
    const address = orderData.drop_location || orderData.shipping_address || orderData.selectedAddress || {};
    
    const subtotal = orderData.itemsTotal || orderData.order_price || orderData.total || 0;
    const shippingCost = orderData.shipping?.shipping || orderData.shipping_cost || 0;
    const tax = orderData.shipping?.tax || orderData.tax || 0;
    const importCharges = orderData.shipping?.importCharges || orderData.import_charges || 0;
    const grandTotal = subtotal + shippingCost + tax + importCharges;

    // Build items table rows
    const tableBody = items.map((item, idx) => {
      const productItem = item.item || item;
      const product = productItem.product || productItem;
      const quantity = item.quantity || productItem.quantity || item.qty || 1;
      const price = productItem.product_price || product.product_price || item.price || 0;
      const total = price * quantity;
      const productName = product.product_name || productItem.product_name || item.title || "Product";
      
      return [
        { text: (idx + 1).toString(), style: 'tableCell', alignment: 'center' },
        { text: productName.substring(0, 50), style: 'tableCell' },
        { text: quantity.toString(), style: 'tableCell', alignment: 'center' },
        { text: formatCurrency(price), style: 'tableCell', alignment: 'right' },
        { text: formatCurrency(total), style: 'tableCell', alignment: 'right' }
      ];
    });

    // Build address text
    const addressLines = [];
    if (address.name || address.fullName) {
      addressLines.push({ text: address.name || address.fullName, style: 'addressText' });
    }
    if (address.full_address || address.address1) {
      addressLines.push({ text: address.full_address || address.address1, style: 'addressText' });
    }
    if (address.address2) {
      addressLines.push({ text: address.address2, style: 'addressText' });
    }
    const cityState = [
      address.city,
      address.district || address.state,
      address.zip || address.postal_code
    ].filter(Boolean).join(', ');
    if (cityState) {
      addressLines.push({ text: cityState, style: 'addressText' });
    }
    if (address.country) {
      addressLines.push({ text: address.country, style: 'addressText' });
    }
    if (address.phone) {
      addressLines.push({ text: `Phone: ${address.phone}`, style: 'addressText' });
    }

    // PDF Document Definition
    const docDefinition = {
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
      defaultStyle: {
        font: 'Roboto',
        fontSize: 10
      },
      styles: {
        header: {
          fontSize: 24,
          bold: true,
          color: '#0c4a3a',
          alignment: 'center',
          margin: [0, 0, 0, 10]
        },
        companyName: {
          fontSize: 28,
          bold: true,
          color: '#0c4a3a',
          alignment: 'center',
          margin: [0, 0, 0, 5]
        },
        companyInfo: {
          fontSize: 9,
          color: '#666666',
          alignment: 'center',
          margin: [0, 0, 0, 20]
        },
        receiptTitle: {
          fontSize: 18,
          bold: true,
          color: '#0c4a3a',
          alignment: 'center',
          margin: [0, 20, 0, 20]
        },
        sectionTitle: {
          fontSize: 12,
          bold: true,
          color: '#0c4a3a',
          margin: [0, 10, 0, 5]
        },
        label: {
          fontSize: 9,
          bold: true,
          color: '#555555',
          margin: [0, 3, 0, 2]
        },
        value: {
          fontSize: 10,
          color: '#333333',
          margin: [0, 0, 0, 5]
        },
        addressText: {
          fontSize: 10,
          color: '#333333',
          margin: [0, 0, 0, 3]
        },
        tableHeader: {
          bold: true,
          fontSize: 10,
          color: 'white',
          fillColor: '#0c4a3a',
          alignment: 'left'
        },
        tableCell: {
          fontSize: 9,
          color: '#333333'
        },
        summaryLabel: {
          fontSize: 10,
          color: '#666666'
        },
        summaryValue: {
          fontSize: 10,
          color: '#333333',
          alignment: 'right'
        },
        totalLabel: {
          fontSize: 14,
          bold: true,
          color: '#0c4a3a'
        },
        totalValue: {
          fontSize: 14,
          bold: true,
          color: '#0c4a3a',
          alignment: 'right'
        },
        footer: {
          fontSize: 9,
          color: '#666666',
          alignment: 'center',
          italics: true,
          margin: [0, 20, 0, 0]
        }
      },
      content: [
        // Header
        {
          text: 'HyderNexa',
          style: 'companyName'
        },
        {
          text: 'E-Commerce Platform',
          style: 'companyInfo'
        },
        {
          text: 'Email: support@hydernexa.com | Phone: +1-800-HYDERNEXA',
          style: 'companyInfo'
        },
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 0,
              x2: 515,
              y2: 0,
              lineWidth: 2,
              lineColor: '#0c4a3a'
            }
          ],
          margin: [0, 10, 0, 20]
        },
        // Receipt Title
        {
          text: 'ORDER RECEIPT',
          style: 'receiptTitle'
        },
        // Order Information and Address (side by side)
        {
          columns: [
            // Order Information
            {
              width: '50%',
              stack: [
                { text: 'Order Information', style: 'sectionTitle' },
                { text: 'Order Code:', style: 'label' },
                { text: orderCode, style: 'value' },
                { text: 'Order Date:', style: 'label' },
                { text: formattedDate, style: 'value' },
                ...(orderData.paymentIntentId || orderData.ref_code ? [
                  { text: 'Payment Reference:', style: 'label' },
                  { text: orderData.paymentIntentId || orderData.ref_code, style: 'value' }
                ] : []),
                ...(orderData.order_status || orderData.status ? [
                  { text: 'Status:', style: 'label' },
                  { text: orderData.order_status || orderData.status, style: 'value' }
                ] : [])
              ]
            },
            // Shipping Address
            ...(addressLines.length > 0 ? [{
              width: '50%',
              stack: [
                { text: 'Shipping Address', style: 'sectionTitle' },
                ...addressLines
              ]
            }] : [])
          ],
          margin: [0, 0, 0, 20]
        },
        // Items Table
        {
          table: {
            headerRows: 1,
            widths: ['5%', '45%', '10%', '20%', '20%'],
            body: [
              [
                { text: '#', style: 'tableHeader', alignment: 'center' },
                { text: 'Product Name', style: 'tableHeader' },
                { text: 'Qty', style: 'tableHeader', alignment: 'center' },
                { text: 'Unit Price', style: 'tableHeader', alignment: 'right' },
                { text: 'Total', style: 'tableHeader', alignment: 'right' }
              ],
              ...tableBody
            ]
          },
          layout: {
            fillColor: function (rowIndex, node, columnIndex) {
              return (rowIndex % 2 === 0) ? '#f9f9f9' : null;
            },
            hLineWidth: function (i, node) {
              return (i === 0 || i === node.table.body.length) ? 1 : 0.5;
            },
            vLineWidth: function (i, node) {
              return 0.5;
            },
            hLineColor: function (i, node) {
              return (i === 0 || i === node.table.body.length) ? '#0c4a3a' : '#dddddd';
            },
            vLineColor: function () {
              return '#dddddd';
            }
          },
          margin: [0, 0, 0, 20]
        },
        // Order Summary
        {
          alignment: 'right',
          margin: [0, 0, 0, 20],
          stack: [
            {
              columns: [
                { text: 'Subtotal:', style: 'summaryLabel', width: 'auto' },
                { text: formatCurrency(subtotal), style: 'summaryValue', width: 100 }
              ],
              margin: [0, 0, 0, 5]
            },
            ...(shippingCost > 0 ? [{
              columns: [
                { text: 'Shipping:', style: 'summaryLabel', width: 'auto' },
                { text: formatCurrency(shippingCost), style: 'summaryValue', width: 100 }
              ],
              margin: [0, 0, 0, 5]
            }] : []),
            ...(tax > 0 ? [{
              columns: [
                { text: 'Tax:', style: 'summaryLabel', width: 'auto' },
                { text: formatCurrency(tax), style: 'summaryValue', width: 100 }
              ],
              margin: [0, 0, 0, 5]
            }] : []),
            ...(importCharges > 0 ? [{
              columns: [
                { text: 'Import Charges:', style: 'summaryLabel', width: 'auto' },
                { text: formatCurrency(importCharges), style: 'summaryValue', width: 100 }
              ],
              margin: [0, 0, 0, 5]
            }] : []),
            {
              canvas: [
                {
                  type: 'line',
                  x1: 0,
                  y1: 0,
                  x2: 200,
                  y2: 0,
                  lineWidth: 1,
                  lineColor: '#0c4a3a'
                }
              ],
              margin: [0, 10, 0, 10]
            },
            {
              columns: [
                { text: 'TOTAL:', style: 'totalLabel', width: 'auto' },
                { text: formatCurrency(grandTotal), style: 'totalValue', width: 100 }
              ]
            }
          ]
        },
        // Payment Information
        ...(orderData.paymentMethod || orderData.payment_method ? [{
          stack: [
            { text: 'Payment Information', style: 'sectionTitle' },
            { text: 'Payment Method:', style: 'label' },
            { text: orderData.paymentMethod || orderData.payment_method, style: 'value' },
            ...(orderData.paymentIntentId || orderData.ref_code ? [
              { text: 'Transaction ID:', style: 'label' },
              { text: orderData.paymentIntentId || orderData.ref_code, style: 'value' }
            ] : [])
          ],
          margin: [0, 0, 0, 20]
        }] : []),
        // Footer
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 0,
              x2: 515,
              y2: 0,
              lineWidth: 0.5,
              lineColor: '#dddddd'
            }
          ],
          margin: [0, 20, 0, 10]
        },
        {
          text: 'Thank you for shopping with HyderNexa!',
          style: 'footer'
        },
        {
          text: 'For any queries, please contact support@hydernexa.com',
          style: 'footer'
        },
        {
          text: 'This is a computer-generated receipt. No signature required.',
          style: 'footer',
          margin: [0, 5, 0, 0]
        }
      ]
    };

    // Generate and download PDF
    pdfMake.createPdf(docDefinition).download(`HyderNexa-Receipt-${orderCode}.pdf`);

    return true;
  } catch (error) {
    console.error('Error generating PDF receipt:', error);
    throw error;
  }
};

/**
 * Generate receipt HTML content (legacy, kept for compatibility)
 */
export const generateReceiptHTML = (order) => {
  const orderDate = new Date(order.order_date || order.placedAt || new Date()).toLocaleString();
  const items = order.item || order.items || [];
  
  const itemsHTML = items.map((item, idx) => {
    const productItem = item.item || item;
    const product = productItem.product || productItem;
    const quantity = item.quantity || productItem.quantity || item.qty || 1;
    const price = productItem.product_price || product.product_price || item.price || 0;
    const total = price * quantity;
    const productName = product.product_name || productItem.product_name || item.title || "Product";
    
    return `
      <tr>
        <td>${idx + 1}</td>
        <td>${productName}</td>
        <td>${quantity}</td>
        <td>$${price.toFixed(2)}</td>
        <td>$${total.toFixed(2)}</td>
      </tr>
    `;
  }).join("");

  const address = order.drop_location || order.shipping_address || {};
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Order Receipt - ${order.order_code || order.id}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #0c4a3a;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #0c4a3a;
          margin: 0;
        }
        .order-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
        }
        .info-section {
          flex: 1;
        }
        .info-section h3 {
          color: #0c4a3a;
          border-bottom: 1px solid #ddd;
          padding-bottom: 5px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        th {
          background-color: #0c4a3a;
          color: white;
        }
        .total-row {
          font-weight: bold;
          font-size: 1.2em;
          background-color: #f5f5f5;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          color: #666;
          font-size: 0.9em;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>HyderNexa</h1>
        <p>Order Receipt</p>
      </div>
      
      <div class="order-info">
        <div class="info-section">
          <h3>Order Information</h3>
          <p><strong>Order Code:</strong> ${order.order_code || order.id}</p>
          <p><strong>Order Date:</strong> ${orderDate}</p>
          <p><strong>Status:</strong> ${order.order_status || order.status || "Processing"}</p>
        </div>
        
        <div class="info-section">
          <h3>Shipping Address</h3>
          <p>${address.name || ""}</p>
          <p>${address.full_address || ""}</p>
          <p>${address.city || ""}, ${address.district || address.state || ""}</p>
          <p>${address.phone ? `Phone: ${address.phone}` : ""}</p>
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Product</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
        </tbody>
        <tfoot>
          <tr class="total-row">
            <td colspan="4" style="text-align: right;">Order Total:</td>
            <td>$${(order.order_price || order.total || 0).toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
      
      ${order.payment && order.payment.length > 0 ? `
        <div class="info-section">
          <h3>Payment Information</h3>
          ${order.payment.map(p => `
            <p><strong>Method:</strong> ${p.payment_method || "N/A"}</p>
            <p><strong>Date:</strong> ${new Date(p.payment_date).toLocaleString()}</p>
            <p><strong>Status:</strong> ${p.is_paid ? "Paid" : "Pending"}</p>
          `).join("")}
        </div>
      ` : ""}
      
      <div class="footer">
        <p>Thank you for shopping with HyderNexa!</p>
        <p>For any queries, please contact support@hydernexa.com</p>
      </div>
    </body>
    </html>
  `;
};

/**
 * Download receipt as HTML (legacy, kept for compatibility)
 */
export const downloadReceipt = async (order) => {
  try {
    const html = generateReceiptHTML(order);
    
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `receipt-${order.order_code || order.id}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error("Error downloading receipt:", error);
    throw error;
  }
};

/**
 * Send receipt via email
 */
export const sendReceiptEmail = async (order, email) => {
  try {
    const API = (await import("../axios")).default;
    
    const response = await API.post("/v1/orders/send-receipt/", {
      order_id: order.id || order.order_code,
      email: email,
      order_data: order,
    });
    
    return response.data;
  } catch (error) {
    console.error("Error sending receipt email:", error);
    if (error.response?.status === 404) {
      throw new Error("Email service is not available. Please download the receipt instead.");
    }
    throw error;
  }
};
