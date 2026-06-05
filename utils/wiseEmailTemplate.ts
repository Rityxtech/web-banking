export const getWiseEmailTemplate = (data: any) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wise Receipt</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400;1,700&display=swap');

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            background-color: #f0f2f5;
            font-family: 'Courier Prime', monospace;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
            color: #111111;
        }

        .receipt-container {
            background-color: #ffffff;
            width: 400px;
            padding: 40px 30px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.05);
            position: relative;
            overflow: hidden;
        }

        /* Diagonal Watermark Overlay */
        .receipt-container::before {
            content: "Wise      Wise      Wise\A\A Wise      Wise      Wise\A\A Wise      Wise      Wise\A\A Wise      Wise      Wise\A\A Wise      Wise      Wise\A\A Wise      Wise      Wise";
            white-space: pre;
            position: absolute;
            top: -20%;
            left: -20%;
            width: 150%;
            height: 150%;
            transform: rotate(-25deg);
            font-size: 22px;
            font-weight: bold;
            color: rgba(0, 0, 0, 0.04);
            pointer-events: none;
            line-height: 2.5;
            z-index: 1;
        }

        /* Content wrapper to stay above watermark background */
        .receipt-content {
            position: relative;
            z-index: 2;
        }

        .logo-container {
            text-align: center;
            margin-bottom: 25px;
        }

        /* Simplified SVG replacement of the Wise Logo */
        .wise-logo {
            width: 140px;
            height: auto;
        }

        .company-details {
            text-align: center;
            font-size: 13px;
            line-height: 1.4;
            margin-bottom: 20px;
        }

        .divider {
            border: none;
            border-top: 1px dashed #666666;
            margin: 15px 0;
        }

        .title-block {
            text-align: center;
            font-size: 14px;
            line-height: 1.4;
            margin: 20px 0;
        }

        .grid-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            row-gap: 12px;
            column-gap: 15px;
            font-size: 13px;
            margin-bottom: 10px;
        }

        .label {
            color: #111111;
        }

        .value {
            font-weight: bold;
        }

        .time-block {
            font-size: 14px;
            line-height: 1.5;
            margin: 15px 0;
        }

        .financial-table {
            width: 100%;
            font-size: 14px;
            border-collapse: collapse;
            margin: 15px 0;
        }

        .financial-table td {
            padding: 4px 0;
        }

        .text-right {
            text-align: right;
        }

        .text-center {
            text-align: center;
        }

        .totals-section {
            width: 100%;
            font-size: 14px;
            margin: 15px 0;
        }

        .totals-section td {
            padding: 6px 0;
        }

        .barcode-container {
            text-align: center;
            margin: 25px 0 15px 0;
        }

        .barcode {
            width: 240px;
            height: 50px;
            background: repeating-linear-gradient(
                90deg,
                #111,
                #111 2px,
                #fff 2px,
                #fff 4px,
                #111 4px,
                #111 8px,
                #fff 8px,
                #fff 10px
            );
            margin: 0 auto 5px auto;
        }

        .barcode-number {
            font-size: 12px;
            letter-spacing: 2px;
        }

        .footer-msg {
            text-align: center;
            font-size: 13px;
            line-height: 1.5;
            margin-top: 20px;
        }
    </style>
</head>
<body>

<div class="receipt-container">
    <div class="receipt-content">
        
        <div class="logo-container">
            <svg class="wise-logo" viewBox="0 0 350 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 20 L55 20 L40 55 L75 15 L110 15 L60 85 L20 85 Z" fill="#163300"/>
                <text x="115" y="75" font-family="'Courier Prime', Arial, sans-serif" font-weight="900" font-size="72" fill="#163300" letter-spacing="-2">wise</text>
            </svg>
        </div>

        <div class="company-details">
            Wise Payments Ltd.<br>
            (Formerly TransferWise)<br>
            6th Floor, Tea Building<br>
            56 Shoreditch High Street<br>
            London E1 6JJ<br>
            United Kingdom<br>
            www.wise.com
        </div>

        <hr class="divider">

        <div class="title-block">
            International Money Transfer Receipt<br>
            Fast, Transparent, Low Fees.
        </div>

        <hr class="divider">

        <div class="grid-section">
            <div>
                <div class="label">Sender :</div>
                <div class="value">${data.sender_name}</div>
            </div>
            <div>
                <div class="label">Transfer ID :</div>
                <div class="value">${data.transfer_id}</div>
            </div>
            <div>
                <div class="label">Email :</div>
                <div class="value" style="word-break: break-all;">${data.recipient_email}</div>
            </div>
            <div>
                <div class="label">Status :</div>
                <div class="value">${data.status}</div>
            </div>
            <div>
                <div class="label">Country :</div>
                <div class="value">${data.country}</div>
            </div>
            <div>
                <div class="label">Method :</div>
                <div class="value">${data.method}</div>
            </div>
        </div>

        <hr class="divider">

        <div class="time-block">
            Date: ${data.date}<br>
            Time: ${data.time}
        </div>

        <hr class="divider">

        <table class="financial-table">
            <tr>
                <td>1 &nbsp; Amount Sent</td>
                <td class="text-right">${data.amount}</td>
            </tr>
            <tr>
                <td>1 &nbsp; Fee</td>
                <td class="text-right">${data.fee}</td>
            </tr>
        </table>

        <hr class="divider">

        <table class="totals-section">
            <tr>
                <td style="padding-left: 80px;">Subtotal</td>
                <td class="text-right">${data.subtotal}</td>
            </tr>
            <tr style="font-weight: bold;">
                <td style="padding-left: 80px;">Total</td>
                <td class="text-right">${data.total}</td>
            </tr>
        </table>

        <hr class="divider">
        <div class="grid-section">
            <div class="label">Payment Method</div>
            <div class="value text-right">${data.payment_method}</div>
            
            <div class="label">Reference Number</div>
            <div class="value text-right">${data.reference_number}</div>
            
            <div class="label">Status</div>
            <div class="value text-right">${data.payment_status}</div>
        </div>

        <hr class="divider">

        <div class="barcode-container">
            <div class="barcode"></div>
            <div class="barcode-number">${data.barcode_number}</div>
        </div>

        <div class="footer-msg">
            Your transfer has been successfully completed.<br>
            Track transfers anytime at www.wise.com<br><br>
            Thank you for using Wise.
        </div>

    </div>
</div>

</body>
</html>`;
