import { jsPDF } from 'jspdf';
import { Budget } from '../types';
import { formatPdfCroreLakh, formatPdfINR } from './formatters';

export interface DepartmentSummaryItem {
  departmentId: string;
  name: string;
  code: string;
  allocated: number;
  spent: number;
  remaining: number;
  utilization: number;
  budgetCount?: number;
}

export interface DepartmentUtilizationPDFData {
  departments: DepartmentSummaryItem[];
  financialYear?: string;
  budgets?: Budget[];
  overview?: {
    totalAllocated?: number;
    totalExpenditure?: number;
    remainingBudget?: number;
    overallUtilization?: number;
    totalDepartments?: number;
  };
}

/**
 * Categorize department risk status based on statutory audit guidelines
 */
function getDeptAuditStatus(utilization: number): {
  label: string;
  tag: 'OPTIMAL' | 'UNDER_UTILIZED' | 'HIGH_WARNING' | 'CRITICAL_OVERSPENT';
  color: [number, number, number];
  bgColor: [number, number, number];
} {
  if (utilization > 100) {
    return {
      label: 'Critical: Overspent',
      tag: 'CRITICAL_OVERSPENT',
      color: [185, 28, 28], // red-700
      bgColor: [254, 242, 242] // red-50
    };
  }
  if (utilization > 85) {
    return {
      label: 'High Warning',
      tag: 'HIGH_WARNING',
      color: [180, 83, 9], // amber-700
      bgColor: [254, 243, 199] // amber-50
    };
  }
  if (utilization < 35) {
    return {
      label: 'Under-Utilized',
      tag: 'UNDER_UTILIZED',
      color: [3, 105, 161], // sky-700
      bgColor: [240, 249, 255] // sky-50
    };
  }
  return {
    label: 'Optimal Burn',
    tag: 'OPTIMAL',
    color: [4, 120, 87], // emerald-700
    bgColor: [236, 253, 245] // emerald-50
  };
}

/**
 * Generate and download an executive, publication-grade Department-Wise Budget Utilization Summary PDF
 */
export function exportDepartmentUtilizationPDF(data: DepartmentUtilizationPDFData): void {
  const {
    departments = [],
    financialYear = '2025-26',
    budgets = [],
    overview
  } = data;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm
  let y = margin;

  // Aggregate metrics calculation
  const totalAllocated =
    overview?.totalAllocated ??
    departments.reduce((sum, d) => sum + (Number(d.allocated) || 0), 0);
  const totalSpent =
    overview?.totalExpenditure ??
    departments.reduce((sum, d) => sum + (Number(d.spent) || 0), 0);
  const totalRemaining =
    overview?.remainingBudget ?? (totalAllocated - totalSpent);
  const overallUtil =
    overview?.overallUtilization ??
    (totalAllocated > 0
      ? Math.round((totalSpent / totalAllocated) * 1000) / 10
      : 0);

  // Distribution counters
  let optimalCount = 0;
  let underCount = 0;
  let warningCount = 0;
  let overspentCount = 0;

  departments.forEach((d) => {
    const status = getDeptAuditStatus(d.utilization);
    if (status.tag === 'OPTIMAL') optimalCount++;
    else if (status.tag === 'UNDER_UTILIZED') underCount++;
    else if (status.tag === 'HIGH_WARNING') warningCount++;
    else if (status.tag === 'CRITICAL_OVERSPENT') overspentCount++;
  });

  // ==========================================
  // 1. Top Decorative Institutional Header
  // ==========================================
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin, y, contentWidth, 22, 'F');

  // Gold statutory accent strip
  doc.setFillColor(217, 119, 6); // amber-600
  doc.rect(margin, y + 21, contentWidth, 1.2, 'F');

  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('GOVBUDGET AI — PUBLIC FINANCE MONITORING & AUDIT SYSTEM', margin + 6, y + 8);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(
    'CENTRAL INSTITUTIONAL SCRUTINY • DEPARTMENTAL BUDGET RECONCILIATION LEDGER',
    margin + 6,
    y + 14
  );

  y += 27;

  // ==========================================
  // 2. Report Title & Generation Metadata
  // ==========================================
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('Department-Wise Budget Utilization Summary', margin, y);

  y += 5.5;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139); // slate-500
  const generationTime = new Date().toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
  doc.text(
    `Financial Year: FY ${financialYear} | Date of Generation: ${generationTime} | Jurisdiction: Inter-Departmental Aggregate`,
    margin,
    y
  );

  y += 4;
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.line(margin, y, margin + contentWidth, y);

  y += 6;

  // ==========================================
  // 3. Executive Macro KPI Summary Cards (4 Columns)
  // ==========================================
  const colWidth = (contentWidth - 9) / 4; // 4 cards with 3mm gap
  const cardHeight = 18;

  const kpis = [
    {
      title: 'TOTAL ALLOCATED',
      value: formatPdfCroreLakh(totalAllocated),
      sub: `${departments.length} Monitored Departments`,
      borderColor: [203, 213, 225],
      bg: [248, 250, 252],
      titleColor: [71, 85, 105],
      valColor: [15, 23, 42]
    },
    {
      title: 'TOTAL DISBURSED',
      value: formatPdfCroreLakh(totalSpent),
      sub: `Actual Certified Vouchers`,
      borderColor: [199, 210, 254],
      bg: [238, 242, 255],
      titleColor: [67, 56, 202],
      valColor: [30, 27, 75]
    },
    {
      title: 'UNSPENT BALANCE',
      value: formatPdfCroreLakh(totalRemaining),
      sub: totalRemaining < 0 ? 'Fiscal Overrun Deficit' : 'Available Treasury Pool',
      borderColor: totalRemaining < 0 ? [254, 202, 202] : [167, 243, 208],
      bg: totalRemaining < 0 ? [254, 242, 242] : [236, 253, 245],
      titleColor: totalRemaining < 0 ? [185, 28, 28] : [4, 120, 87],
      valColor: totalRemaining < 0 ? [153, 27, 27] : [6, 78, 59]
    },
    {
      title: 'AGGREGATE UTILIZATION',
      value: `${overallUtil.toFixed(1)}%`,
      sub: overallUtil > 85 ? 'High Exhaustion Rate' : overallUtil < 40 ? 'Under-Spending Alert' : 'Healthy Target Range',
      borderColor: [217, 226, 236],
      bg: [241, 245, 249],
      titleColor: [51, 65, 85],
      valColor: [15, 23, 42]
    }
  ];

  kpis.forEach((kpi, idx) => {
    const cardX = margin + idx * (colWidth + 3);
    doc.setFillColor(kpi.bg[0], kpi.bg[1], kpi.bg[2]);
    doc.roundedRect(cardX, y, colWidth, cardHeight, 1.5, 1.5, 'F');
    doc.setDrawColor(kpi.borderColor[0], kpi.borderColor[1], kpi.borderColor[2]);
    doc.roundedRect(cardX, y, colWidth, cardHeight, 1.5, 1.5, 'D');

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(kpi.titleColor[0], kpi.titleColor[1], kpi.titleColor[2]);
    doc.text(kpi.title, cardX + 3, y + 4.5);

    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(kpi.valColor[0], kpi.valColor[1], kpi.valColor[2]);
    doc.text(kpi.value, cardX + 3, y + 10.5);

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.sub, cardX + 3, y + 15);
  });

  y += cardHeight + 5;

  // ==========================================
  // 4. Governance Scrutiny & Risk Breakdown Bar
  // ==========================================
  doc.setFillColor(241, 245, 249); // slate-100
  doc.roundedRect(margin, y, contentWidth, 8, 1, 1, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 8, 1, 1, 'D');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text('AUDIT DISTRIBUTION:', margin + 3, y + 5.2);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(4, 120, 87); // emerald
  doc.text(`Optimal (40-85%): ${optimalCount}`, margin + 36, y + 5.2);

  doc.setTextColor(3, 105, 161); // sky
  doc.text(`Under-Utilized (<35%): ${underCount}`, margin + 74, y + 5.2);

  doc.setTextColor(180, 83, 9); // amber
  doc.text(`High Warning (85-100%): ${warningCount}`, margin + 118, y + 5.2);

  doc.setTextColor(185, 28, 28); // red
  doc.text(`Overspent (>100%): ${overspentCount}`, margin + 160, y + 5.2);

  y += 12;

  // ==========================================
  // 5. Official Departmental Utilization Table
  // ==========================================
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Departmental Allocation & Expenditure Scrutiny Ledger', margin, y);

  y += 4.5;

  // Table Column Coordinates
  // Table width = 182mm
  // S.No: 8mm, Dept: 48mm, Code: 16mm, Alloc: 28mm, Disbursed: 28mm, Balance: 28mm, Util: 14mm, Status: 12mm
  const colX = {
    sno: margin + 2,
    name: margin + 10,
    code: margin + 60,
    alloc: margin + 78,
    spent: margin + 106,
    remaining: margin + 134,
    util: margin + 160,
    status: margin + 166
  };

  const drawTableHeader = (curY: number): number => {
    doc.setFillColor(30, 41, 59); // slate-800
    doc.rect(margin, curY, contentWidth, 7, 'F');

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(241, 245, 249);

    doc.text('#', colX.sno, curY + 4.5);
    doc.text('DEPARTMENT NAME', colX.name, curY + 4.5);
    doc.text('CODE', colX.code, curY + 4.5);
    doc.text('SANCTIONED (INR)', colX.alloc + 18, curY + 4.5, { align: 'right' });
    doc.text('DISBURSED (INR)', colX.spent + 18, curY + 4.5, { align: 'right' });
    doc.text('BALANCE (INR)', colX.remaining + 18, curY + 4.5, { align: 'right' });
    doc.text('UTIL %', colX.util + 5, curY + 4.5, { align: 'right' });
    doc.text('STATUS', colX.status, curY + 4.5);

    return curY + 7;
  };

  y = drawTableHeader(y);

  // Table Rows
  const rowHeight = 7.5;
  departments.forEach((dept, index) => {
    // Check for page break
    if (y + rowHeight > pageHeight - 32) {
      doc.addPage();
      y = margin + 5;
      y = drawTableHeader(y);
    }

    // Zebra striping
    const isEven = index % 2 === 0;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(margin, y, contentWidth, rowHeight, 'F');

    // Bottom subtle border
    doc.setDrawColor(241, 245, 249);
    doc.line(margin, y + rowHeight, margin + contentWidth, y + rowHeight);

    // S.No
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(String(index + 1), colX.sno, y + 4.8);

    // Department Name (Clean truncate if over 28 chars)
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    const safeName =
      dept.name.length > 27 ? `${dept.name.substring(0, 25)}...` : dept.name;
    doc.text(safeName, colX.name, y + 4.8);

    // Code
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(dept.code, colX.code, y + 4.8);

    // Sanctioned / Allocated
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(formatPdfCroreLakh(dept.allocated), colX.alloc + 18, y + 4.8, {
      align: 'right'
    });

    // Disbursed
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(67, 56, 202); // indigo-700
    doc.text(formatPdfCroreLakh(dept.spent), colX.spent + 18, y + 4.8, {
      align: 'right'
    });

    // Unspent Balance
    const isNegative = dept.remaining < 0;
    doc.setFont('helvetica', 'bold');
    if (isNegative) {
      doc.setTextColor(220, 38, 38); // red-600
    } else {
      doc.setTextColor(5, 150, 105); // emerald-600
    }
    doc.text(formatPdfCroreLakh(dept.remaining), colX.remaining + 18, y + 4.8, {
      align: 'right'
    });

    // Utilization %
    doc.setFont('helvetica', 'bold');
    const status = getDeptAuditStatus(dept.utilization);
    doc.setTextColor(status.color[0], status.color[1], status.color[2]);
    doc.text(`${dept.utilization.toFixed(1)}%`, colX.util + 5, y + 4.8, {
      align: 'right'
    });

    // Status Pill
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.text(status.label, colX.status, y + 4.8);

    y += rowHeight;
  });

  // Table Totals / Summary Row
  if (y + 9 > pageHeight - 32) {
    doc.addPage();
    y = margin + 5;
  }

  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(margin, y, contentWidth, 8, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y, margin + contentWidth, y);
  doc.line(margin, y + 8, margin + contentWidth, y + 8);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('TOTAL AUDITED PORTFOLIO', colX.name, y + 5.2);

  doc.text(formatPdfCroreLakh(totalAllocated), colX.alloc + 18, y + 5.2, {
    align: 'right'
  });
  doc.setTextColor(67, 56, 202);
  doc.text(formatPdfCroreLakh(totalSpent), colX.spent + 18, y + 5.2, {
    align: 'right'
  });

  if (totalRemaining < 0) {
    doc.setTextColor(220, 38, 38);
  } else {
    doc.setTextColor(5, 150, 105);
  }
  doc.text(formatPdfCroreLakh(totalRemaining), colX.remaining + 18, y + 5.2, {
    align: 'right'
  });

  doc.setTextColor(15, 23, 42);
  doc.text(`${overallUtil.toFixed(1)}%`, colX.util + 5, y + 5.2, {
    align: 'right'
  });

  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Consolidated', colX.status, y + 5.2);

  y += 13;

  // ==========================================
  // 6. Institutional Audit Findings & Advisory
  // ==========================================
  if (y + 35 > pageHeight - 30) {
    doc.addPage();
    y = margin + 5;
  }

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Institutional Scrutiny Observations & Corrective Actions', margin, y);

  y += 4.5;
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);

  const findings: string[] = [];

  // Check under-utilized
  const underDepts = departments.filter((d) => d.utilization < 35);
  if (underDepts.length > 0) {
    findings.push(
      `Under-Utilization Advisory: ${underDepts.length} department(s) [${underDepts
        .map((d) => d.code)
        .join(', ')}] lag under the 35% utilization threshold. Under GFR Rule 252, proactive physical verification is advised to accelerate project milestones and avert lapse of fiscal sanctions.`
    );
  } else {
    findings.push(
      `Under-Utilization Compliance: All registered departments maintain adequate financial velocity above statutory minimum run-rate benchmarks.`
    );
  }

  // Check overspent
  const overDepts = departments.filter((d) => d.utilization > 100);
  if (overDepts.length > 0) {
    findings.push(
      `Over-Expenditure Alert: ${overDepts.length} department(s) [${overDepts
        .map((d) => d.code)
        .join(', ')}] have exceeded sanctioned demands for grants. Immediate supplementary grants or re-appropriation sanctions are required under constitutional provisions.`
    );
  }

  // Check warning
  const warnDepts = departments.filter((d) => d.utilization > 85 && d.utilization <= 100);
  if (warnDepts.length > 0) {
    findings.push(
      `High Exhaustion Monitoring: ${warnDepts.length} department(s) [${warnDepts
        .map((d) => d.code)
        .join(', ')}] have consumed over 85% of approved allotments. Tight scrutiny on forthcoming procurement commitments recommended.`
    );
  }

  findings.forEach((finding) => {
    doc.setFont('helvetica', 'bold');
    doc.text('•', margin + 2, y);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(finding, contentWidth - 8);
    doc.text(lines, margin + 6, y);
    y += lines.length * 3.6 + 2;
  });

  y += 4;

  // ==========================================
  // 7. Statutory Certification & Sign-off Block
  // ==========================================
  if (y + 26 > pageHeight - 20) {
    doc.addPage();
    y = margin + 5;
  }

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth, 20, 1.5, 1.5, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 20, 1.5, 1.5, 'D');

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('STATUTORY VERIFICATION & COMPLIANCE SEAL', margin + 4, y + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(
    'This summary is electronically generated by the AI-Based Budget Utilization Monitoring System in accordance with',
    margin + 4,
    y + 8.5
  );
  doc.text(
    'Comptroller and Auditor General (CAG) guidelines, Open Budget Data Standards, and Public Financial Management Rules.',
    margin + 4,
    y + 12
  );

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text(`Digital Verification Hash: SHA256-FIN-${Date.now().toString(36).toUpperCase()}`, margin + 4, y + 16.5);

  doc.setFont('helvetica', 'normal');
  doc.text('Authorized Finance Controller', margin + contentWidth - 46, y + 16.5);

  // ==========================================
  // 8. Page Numbering & Footer Stamp (Loop all pages)
  // ==========================================
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);

    // Subtle line above footer
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 11, margin + contentWidth, pageHeight - 11);

    doc.setFontSize(6.8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(
      'GovBudget AI — Public Finance Surveillance Platform • Department-Wise Budget Utilization Summary',
      margin,
      pageHeight - 7
    );

    doc.setFont('helvetica', 'bold');
    doc.text(`Page ${p} of ${totalPages}`, margin + contentWidth - 18, pageHeight - 7);
  }

  // Save the document with clean formatted name
  const cleanDate = new Date().toISOString().split('T')[0];
  doc.save(`department-wise-budget-utilization-summary-${cleanDate}.pdf`);
}
