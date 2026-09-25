const loanInput = document.getElementById("loan");
const rateInput = document.getElementById("rate");
const monthsInput = document.getElementById("months");
const balanceFeeInput = document.getElementById("balanceFee");
const monthlyFeeInput = document.getElementById("monthlyFee");

const calculateButton = document.getElementById("calculate");
let selectedFormat = "a4";

// PDF format option selection
document.querySelectorAll(".pdf-format").forEach(option => {
  option.addEventListener("click", () => {
    document.querySelectorAll(".pdf-format").forEach(x => {
      x.classList.remove("selected");
      x.setAttribute("aria-checked", "false");
      x.setAttribute("tabindex", "-1");
    });
    option.classList.add("selected");
    option.setAttribute("aria-checked", "true");
    option.setAttribute("tabindex", "0");
    option.focus();
    selectedFormat = option.dataset.format;
  });

  option.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      document.querySelectorAll(".pdf-format").forEach(x => {
        x.classList.remove("selected");
        x.setAttribute("aria-checked", "false");
        x.setAttribute("tabindex", "-1");
      });
      option.classList.add("selected");
      option.setAttribute("aria-checked", "true");
      option.setAttribute("tabindex", "0");
      selectedFormat = option.dataset.format;
    }
  });
});

let selectedType = "A";

const money = value =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);

// -----------------------------
// Option selection
// -----------------------------

function selectOption(option) {
  document.querySelectorAll(".option").forEach(x => {
    x.classList.remove("selected");
    x.setAttribute("aria-checked", "false");
    x.setAttribute("tabindex", "-1");
  });

  option.classList.add("selected");
  option.setAttribute("aria-checked", "true");
  option.setAttribute("tabindex", "0");

  selectedType = option.dataset.type;

  if (
    loanInput.checkValidity() &&
    rateInput.checkValidity() &&
    monthsInput.checkValidity() &&
    balanceFeeInput.checkValidity() &&
    monthlyFeeInput.checkValidity()
  ) {
    calculate();
  }
}

document.querySelectorAll(".option").forEach(option => {
  option.addEventListener("click", () => selectOption(option));

  option.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      selectOption(option);
    }
    // Arrow keys for radio group navigation
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const options = [...document.querySelectorAll(".option")];
      const idx = options.indexOf(option);
      const next = options[(idx + 1) % options.length];
      next.focus();
      selectOption(next);
    }
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const options = [...document.querySelectorAll(".option")];
      const idx = options.indexOf(option);
      const prev = options[(idx - 1 + options.length) % options.length];
      prev.focus();
      selectOption(prev);
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
// Main calculation (pure function)
// -----------------------------

function calculateLoan(loan, annualRate, months, balanceFeeRate, fixedMonthlyFee, selectedType) {
  const monthlyRate = annualRate / 100 / 12;
  let balance = loan;

  let totalInterest = 0;
  let totalPaid = 0;
  let totalBalanceFees = 0;
  let totalMonthlyFees = 0;
  let totalFees = 0;

  const rows = [];

  if (selectedType === "A") {
    let fixedPayment;
    if (monthlyRate === 0) {
      fixedPayment = loan / months;
    } else {
      fixedPayment =
        loan *
        (monthlyRate * Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1);
    }

    for (let month = 1; month <= months; month++) {
      const interest = balance * monthlyRate;
      const balanceFee = balance * balanceFeeRate;
      const monthlyFee = fixedMonthlyFee;

      let principal = fixedPayment - interest;
      if (month === months) {
        principal = balance;
      }

      const payment = principal + interest;
      const totalCost = payment + balanceFee + monthlyFee;

      balance -= principal;
      if (balance < 0.000001) balance = 0;

      totalInterest += interest;
      totalBalanceFees += balanceFee;
      totalMonthlyFees += monthlyFee;
      totalFees += balanceFee + monthlyFee;
      totalPaid += totalCost;

      rows.push({ month, principal, interest, balanceFee, monthlyFee, payment, totalCost, balance });
    }
  } else {
    const fixedPrincipal = loan / months;

    for (let month = 1; month <= months; month++) {
      const interest = balance * monthlyRate;
      const balanceFee = balance * balanceFeeRate;
      const monthlyFee = fixedMonthlyFee;

      const principal = month === months ? balance : fixedPrincipal;
      const payment = principal + interest;
      const totalCost = payment + balanceFee + monthlyFee;

      balance -= principal;
      if (balance < 0.000001) balance = 0;

      totalInterest += interest;
      totalBalanceFees += balanceFee;
      totalMonthlyFees += monthlyFee;
      totalFees += balanceFee + monthlyFee;
      totalPaid += totalCost;

      rows.push({ month, principal, interest, balanceFee, monthlyFee, payment, totalCost, balance });
    }
  }

  const firstPayment = rows[0].totalCost;
  const lastPayment = rows[rows.length - 1].totalCost;

  return {
    monthlyRate,
    totalInterest,
    totalPaid,
    totalBalanceFees,
    totalMonthlyFees,
    totalFees,
    firstPayment,
    lastPayment,
    rows,
    payment: selectedType === "A" ? rows[0].payment : null
  };
}

// -----------------------------
// UI calculation
// -----------------------------

function calculate() {
  const loan = Number(loanInput.value);
  const annualRate = Number(rateInput.value);
  const months = Number(monthsInput.value);
  const balanceFeeRate = Number(balanceFeeInput.value) / 100;
  const fixedMonthlyFee = Number(monthlyFeeInput.value);

  const result = calculateLoan(loan, annualRate, months, balanceFeeRate, fixedMonthlyFee, selectedType);

  document.getElementById("resultTitle").textContent =
    selectedType === "A"
      ? "Option A — Equal Total Installments"
      : "Option B — Equal Principal";

  document.getElementById("monthlyRate").textContent = (result.monthlyRate * 100).toFixed(4) + "%";

  document.getElementById("payment").textContent =
    selectedType === "A"
      ? money(result.payment)
      : money(result.firstPayment) + " → " + money(result.lastPayment);

  document.getElementById("interest").textContent = money(result.totalInterest);
  document.getElementById("totalPaid").textContent = money(result.totalPaid);
  document.getElementById("principal").textContent = money(loan);
  document.getElementById("firstPayment").textContent = money(result.firstPayment);
  document.getElementById("lastPayment").textContent = money(result.lastPayment);
  document.getElementById("totalMonths").textContent = months;
  document.getElementById("totalBalanceFees").textContent = money(result.totalBalanceFees);
  document.getElementById("totalMonthlyFees").textContent = money(result.totalMonthlyFees);
  document.getElementById("totalFees").textContent = money(result.totalFees);

  document.getElementById("schedule").innerHTML =
    result.rows.map(row => `
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
  const doc = new jsPDF({ unit: "mm", format: selectedFormat });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const loan = Number(loanInput.value);
  const annualRate = Number(rateInput.value);
  const months = Number(monthsInput.value);
  const balanceFee = Number(balanceFeeInput.value);
  const monthlyFee = Number(monthlyFeeInput.value);
  const balanceFeeRate = balanceFee / 100;
  const fixedMonthlyFee = monthlyFee;

  const optionTitle =
    selectedType === "A"
      ? "Option A — Equal Total Installments"
      : "Option B — Equal Principal";

  // Recalculate for PDF
  const result = calculateLoan(loan, annualRate, months, balanceFeeRate, fixedMonthlyFee, selectedType);

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
  doc.rect(0, 0, pageWidth, 32, "F");

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
    pageWidth - 6,
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
    pageWidth - 28,
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
    (result.monthlyRate * 100).toFixed(4) + "%",
    105,
    66
  );

  doc.text(
    money(result.totalInterest),
    105,
    78
  );

  doc.text(
    money(result.totalPaid),
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
    `Total Balance Fees: ${money(result.totalBalanceFees)}`,
    20,
    128
  );

  doc.text(
    `Total Fixed Fees: ${money(result.totalMonthlyFees)}`,
    105,
    128
  );

  doc.text(
    `Total Fees: ${money(result.totalFees)}`,
    20,
    134
  );

  // -----------------------------
  // Installment table
  // -----------------------------

  const tableBody = result.rows.map(row => [
    row.month.toString(),
    money(row.principal),
    money(row.interest),
    money(row.balanceFee),
    money(row.monthlyFee),
    money(row.totalCost),
    money(row.balance)
  ]);

  doc.autoTable({

    startY: 140,

    head: [[
      "Month",
      "Principal",
      "Interest",
      "Balance Fee",
      "Fixed Fee",
      "Payment",
      "Balance"
    ]],


    body: tableBody,

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
      0: { halign: "center" },
      1: { halign: "right" },
      2: { halign: "right" },
      3: { halign: "right" },
      4: { halign: "right" },
      5: { halign: "right" },
      6: { halign: "right" }
    },

    didParseCell: (hookData) => {
      if (hookData.section === 'body') {
        // hookData.row.index is 0-based for body rows
        // DOM: tr:nth-child(even) = 2nd, 4th, 6th... = index 1, 3, 5...
        if (hookData.row.index % 2 === 1) {
          hookData.cell.styles.fillColor = [248, 250, 252];
        } else {
          hookData.cell.styles.fillColor = [255, 255, 255];
        }
      }
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
      pageWidth - 14,
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
      pageWidth - 6,
      pageHeight - 8,
      { align: "right" }
    );

  }


  // -----------------------------
  // Save
  // -----------------------------

  const filename =
    selectedType === "A"
      ? `loan-installments-option-A-${selectedFormat}.pdf`
      : `loan-installments-option-B-${selectedFormat}.pdf`;

  doc.save(filename);
});

// -----------------------------
// Initial calculation
// -----------------------------

calculate();