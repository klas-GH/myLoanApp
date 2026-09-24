const loanInput = document.getElementById("loan");
const rateInput = document.getElementById("rate");
const monthsInput = document.getElementById("months");
const balanceFeeInput = document.getElementById("balanceFee");
const monthlyFeeInput = document.getElementById("monthlyFee");

const calculateButton = document.getElementById("calculate");

let selectedType = "A";

const money = value =>
new Intl.NumberFormat("en-US", {
minimumFractionDigits: 2,
maximumFractionDigits: 2
}).format(value);

// -----------------------------
// Option selection
// -----------------------------

document.querySelectorAll(".option").forEach(option => {
option.addEventListener("click", () => {

document.querySelectorAll(".option")
  .forEach(x => x.classList.remove("selected"));

option.classList.add("selected");

selectedType = option.dataset.type;

// Recalculate only if current inputs are valid
if (
  loanInput.checkValidity() &&
  rateInput.checkValidity() &&
  monthsInput.checkValidity() &&
  balanceFeeInput.checkValidity() &&
  monthlyFeeInput.checkValidity()
) {
  calculate();
}


});
});

// -----------------------------
// Calculate button
// -----------------------------

calculateButton.addEventListener("click", () => {

if (!loanInput.checkValidity()) {
loanInput.reportValidity();
return;
}

if (!rateInput.checkValidity()) {
rateInput.reportValidity();
return;
}

if (!monthsInput.checkValidity()) {
monthsInput.reportValidity();
return;
}

if (!balanceFeeInput.checkValidity()) {
balanceFeeInput.reportValidity();
return;
}

if (!monthlyFeeInput.checkValidity()) {
monthlyFeeInput.reportValidity();
return;
}

calculate();
});

// -----------------------------
// Main calculation
// -----------------------------

function calculate() {

const loan = Number(loanInput.value);
const annualRate = Number(rateInput.value);
const months = Number(monthsInput.value);

const balanceFeeRate =
Number(balanceFeeInput.value) / 100;

const fixedMonthlyFee =
Number(monthlyFeeInput.value);

const monthlyRate =
annualRate / 100 / 12;

let balance = loan;

let totalInterest = 0;
let totalPaid = 0;

let totalBalanceFees = 0;
let totalMonthlyFees = 0;
let totalFees = 0;

const rows = [];

/*
OPTION A
Equal total loan installments
(principal + interest)

The additional fees are charged on top of
the normal loan installment.


*/

if (selectedType === "A") {

let fixedPayment;

if (monthlyRate === 0) {

  fixedPayment = loan / months;

} else {

  fixedPayment =
    loan *
    (
      monthlyRate *
      Math.pow(1 + monthlyRate, months)
    ) /
    (
      Math.pow(1 + monthlyRate, months) - 1
    );
}


for (let month = 1; month <= months; month++) {

  // Interest is calculated on the opening balance
  const interest =
    balance * monthlyRate;

  // Balance fee is also calculated on the
  // opening balance for that month
  const balanceFee =
    balance * balanceFeeRate;

  const monthlyFee =
    fixedMonthlyFee;


  // Normal loan principal
  let principal =
    fixedPayment - interest;


  // Final month clears the balance exactly
  if (month === months) {
    principal = balance;
  }


  // Base loan installment
  const payment =
    principal + interest;


  // Actual amount paid by customer
  const totalCost =
    payment +
    balanceFee +
    monthlyFee;


  // Reduce loan balance only by principal
  balance -= principal;

  if (balance < 0.000001) {
    balance = 0;
  }


  // Totals
  totalInterest += interest;
  totalBalanceFees += balanceFee;
  totalMonthlyFees += monthlyFee;
  totalFees += balanceFee + monthlyFee;
  totalPaid += totalCost;


  rows.push({
    month,
    principal,
    interest,
    balanceFee,
    monthlyFee,
    payment,
    totalCost,
    balance
  });
}


}

/*
OPTION B
Equal principal repayment
*/

else {

const fixedPrincipal =
  loan / months;


for (let month = 1; month <= months; month++) {

  // Interest on opening balance
  const interest =
    balance * monthlyRate;

  // Balance fee on opening balance
  const balanceFee =
    balance * balanceFeeRate;

  const monthlyFee =
    fixedMonthlyFee;


  // Equal principal
  const principal =
    month === months
      ? balance
      : fixedPrincipal;


  // Base loan installment
  const payment =
    principal + interest;


  // Actual amount paid
  const totalCost =
    payment +
    balanceFee +
    monthlyFee;


  // Reduce loan balance only by principal
  balance -= principal;

  if (balance < 0.000001) {
    balance = 0;
  }


  // Totals
  totalInterest += interest;
  totalBalanceFees += balanceFee;
  totalMonthlyFees += monthlyFee;
  totalFees += balanceFee + monthlyFee;
  totalPaid += totalCost;


  rows.push({
    month,
    principal,
    interest,
    balanceFee,
    monthlyFee,
    payment,
    totalCost,
    balance
  });
}


}

// -----------------------------
// Results
// -----------------------------

const firstPayment =
rows[0].totalCost;

const lastPayment =
rows[rows.length - 1].totalCost;

document.getElementById("resultTitle").textContent =
selectedType === "A"
? "Option A — Equal Total Installments"
: "Option B — Equal Principal";

document.getElementById("monthlyRate").textContent =
(monthlyRate * 100).toFixed(4) + "%";

/*
"Payment" now represents the actual amount
paid by the customer, including fees.
*/
document.getElementById("payment").textContent =
selectedType === "A"
? money(firstPayment) + " → " + money(lastPayment)
: money(firstPayment) + " → " + money(lastPayment);

document.getElementById("interest").textContent =
money(totalInterest);

/*
Total Paid = principal + interest + all fees
*/
document.getElementById("totalPaid").textContent =
money(totalPaid);

document.getElementById("principal").textContent =
money(loan);

document.getElementById("firstPayment").textContent =
money(firstPayment);

document.getElementById("lastPayment").textContent =
money(lastPayment);

document.getElementById("totalMonths").textContent =
months;

// -----------------------------
// New fee results
// -----------------------------

document.getElementById("totalBalanceFees").textContent =
money(totalBalanceFees);

document.getElementById("totalMonthlyFees").textContent =
money(totalMonthlyFees);

document.getElementById("totalFees").textContent =
money(totalFees);

// -----------------------------
// Amortization schedule
// -----------------------------

document.getElementById("schedule").innerHTML =
  rows.map(row => `
    <tr>
      <td>${row.month}</td>
      <td>${money(row.principal)}</td>
      <td>${money(row.interest)}</td>
      <td>${money(row.balanceFee)}</td>
      <td>${money(row.monthlyFee)}</td>
      <td>${money(row.totalCost)}</td>
      <td>${money(row.balance)}</td>
    </tr>
  `).join("");


}

// -----------------------------
// PDF Export
// -----------------------------

document.getElementById("exportPdf").addEventListener("click", () => {

// -----------------------------
// Validate inputs
// -----------------------------

if (!loanInput.checkValidity()) {
loanInput.reportValidity();
return;
}

if (!rateInput.checkValidity()) {
rateInput.reportValidity();
return;
}

if (!monthsInput.checkValidity()) {
monthsInput.reportValidity();
return;
}

if (!balanceFeeInput.checkValidity()) {
balanceFeeInput.reportValidity();
return;
}

if (!monthlyFeeInput.checkValidity()) {
monthlyFeeInput.reportValidity();
return;
}

// -----------------------------
// Create PDF
// -----------------------------

const { jsPDF } = window.jspdf;
const doc = new jsPDF();

const loan =
Number(loanInput.value);

const annualRate =
Number(rateInput.value);

const months =
Number(monthsInput.value);

const balanceFee =
Number(balanceFeeInput.value);

const monthlyFee =
Number(monthlyFeeInput.value);

const optionTitle =
selectedType === "A"
? "Option A — Equal Total Installments"
: "Option B — Equal Principal";

// -----------------------------
// Colors
// -----------------------------

const blue = [37, 99, 235];
const dark = [31, 41, 55];
const gray = [107, 114, 128];
const lightGray = [243, 244, 246];
const white = [255, 255, 255];

// -----------------------------
// Header
// -----------------------------

doc.setFillColor(...blue);
doc.rect(0, 0, 210, 32, "F");

doc.setTextColor(...white);
doc.setFont("helvetica", "bold");
doc.setFontSize(20);

doc.text("Loan Calculator", 14, 15);

doc.setFont("helvetica", "normal");
doc.setFontSize(10);

doc.text(optionTitle, 14, 24);

// -----------------------------
// Generated date
// -----------------------------

const now = new Date();

const generatedDate =
now.toLocaleString("en-US", {
year: "numeric",
month: "short",
day: "numeric",
hour: "2-digit",
minute: "2-digit"
});

doc.setFontSize(8);

doc.text(
`Generated: ${generatedDate}`,
196,
24,
{ align: "right" }
);

// -----------------------------
// Summary title
// -----------------------------

doc.setTextColor(...dark);
doc.setFont("helvetica", "bold");
doc.setFontSize(13);

doc.text("Loan Summary", 14, 45);

// -----------------------------
// Summary box
// -----------------------------

doc.setFillColor(...lightGray);
doc.roundedRect(
14,
51,
182,
58,
3,
3,
"F"
);

doc.setFont("helvetica", "normal");
doc.setFontSize(9);
doc.setTextColor(...gray);

// Column 1
doc.text("Loan Amount", 20, 60);
doc.text("Annual Interest", 20, 72);
doc.text("Number of Months", 20, 84);
doc.text("Balance Fee", 20, 96);

// Column 2
doc.text("Monthly Rate", 105, 60);
doc.text("Total Interest", 105, 72);
doc.text("Total Paid", 105, 84);
doc.text("Fixed Monthly Fee", 105, 96);

// Values
doc.setFont("helvetica", "bold");
doc.setFontSize(10);
doc.setTextColor(...dark);

doc.text(money(loan), 20, 66);

doc.text(
`${annualRate.toFixed(2)}%`,
20,
78
);

doc.text(
`${months}`,
20,
90
);

doc.text(
`${balanceFee.toFixed(2)}%`,
20,
102
);

doc.text(
document.getElementById("monthlyRate").textContent,
105,
66
);

doc.text(
document.getElementById("interest").textContent,
105,
78
);

doc.text(
document.getElementById("totalPaid").textContent,
105,
90
);

doc.text(
money(monthlyFee),
105,
102
);

// -----------------------------
// Fee information
// -----------------------------

doc.setFont("helvetica", "bold");
doc.setFontSize(13);

doc.text("Fee Summary", 14, 118);

doc.setFont("helvetica", "normal");
doc.setFontSize(10);

doc.text(
`Total Balance Fees: ${document.getElementById("totalBalanceFees").textContent}`,
20,
128
);

doc.text(
`Total Fixed Fees: ${document.getElementById("totalMonthlyFees").textContent}`,
105,
128
);

doc.text(
`Total Fees: ${document.getElementById("totalFees").textContent}`,
20,
134
);

// -----------------------------
// Payment information
// -----------------------------

doc.setFont("helvetica", "bold");
doc.setFontSize(13);

//doc.text("Payment Information", 14, 159);

doc.setFont("helvetica", "normal");
doc.setFontSize(10);

/*
doc.text(
`First Payment: ${document.getElementById("firstPayment").textContent}`,
20,
169
);

doc.text(
`Last Payment: ${document.getElementById("lastPayment").textContent}`,
105,
169
);
*/

// -----------------------------
// Installment table
// -----------------------------

const table =
document.querySelector("#schedule");

const rows =
[...table.querySelectorAll("tr")].map(row =>
[...row.querySelectorAll("td")]
.map(cell => cell.textContent.trim())
);

doc.autoTable({

startY: 140,  //179

head: [[
  "Month",
  "Principal",
  "Interest",
  "Balance Fee",
  "Fixed Fee",
  "Payment",
  "Balance"
]],


body: rows,

theme: "grid",


styles: {
  font: "helvetica",
  fontSize: 8,
  cellPadding: 2.5,
  textColor: dark,
  lineColor: [220, 223, 230],
  lineWidth: 0.2
},



headStyles: {
  fillColor: blue,
  textColor: white,
  fontStyle: "bold",
  halign: "center"
},

columnStyles: {
  0: {
    halign: "center"
  },
  1: {
    halign: "right"
  },
  2: {
    halign: "right"
  },
  3: {
    halign: "right"
  },
  4: {
    halign: "right"
  },
  5: {
    halign: "right"
  },
  6: {
    halign: "right"
  }
},


alternateRowStyles: {
  fillColor: [248, 250, 252]
},

margin: {
  left: 14,
  right: 14
}


});

// -----------------------------
// Footer / Page numbers
// -----------------------------

const pageCount =
doc.internal.getNumberOfPages();

for (let page = 1; page <= pageCount; page++) {

doc.setPage(page);

const pageHeight =
  doc.internal.pageSize.getHeight();


// Footer line
doc.setDrawColor(220, 223, 230);

doc.line(
  14,
  pageHeight - 15,
  196,
  pageHeight - 15
);


// Footer text
doc.setFont("helvetica", "normal");
doc.setFontSize(8);
doc.setTextColor(...gray);

doc.text(
  "Loan Calculator — Amortization Schedule",
  14,
  pageHeight - 8
);

doc.text(
  `Page ${page} of ${pageCount}`,
  196,
  pageHeight - 8,
  { align: "right" }
);


}

// -----------------------------
// Save
// -----------------------------

const filename =
selectedType === "A"
? "loan-installments-option-A.pdf"
: "loan-installments-option-B.pdf";

doc.save(filename);
});

// -----------------------------
// Initial calculation
// -----------------------------

calculate();