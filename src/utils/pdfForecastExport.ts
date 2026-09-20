import { jsPDF } from 'jspdf';
import { BudgetForecastOutput, ConsolidatedForecastSummary } from '../types';
import { formatPdfCroreLakh, formatPdfINR, formatDate } from './formatters';

/**
 * Helper to get clean status display details
 */
function getStatusDetails(status: BudgetForecastOutput['forecastedStatus']) {
  switch (status) {
    case 'ON_TRACK':
      return {
        label: 'ON TRACK (OPTIMAL)',
        color: [5, 150, 105], // emerald-600
        bgColor: [236, 253, 245], // emerald-50
        borderColor: [167, 243, 208]
      };
    case 'PROJECTED_SURPLUS':
      return {
        label: 'PROJECTED SURPLUS (LAPSE RISK)',
        color: [217, 119, 6], // amber-600
        bgColor: [254, 252, 232], // amber-50
        borderColor: [253, 230, 138]
      };
    case 'PROJECTED_DEFICIT':
      return {
        label: 'PROJECTED DEFICIT (CEILING RISK)',
        color: [234, 88, 12], // orange-600
        bgColor: [255, 247, 237], // orange-50
        borderColor: [254, 215, 170]
      };
    case 'SEVERE_BREACH':
    default:
      return {
        label: 'CRITICAL CEILING BREACH',
        color: [220, 38, 38], // red-600
        bgColor: [254, 242, 242], // red-50
        borderColor: [254, 202, 202]
      };
  }
}

/**
 * Generate and export a single scheme AI Budget Forecast PDF Summary Report
 */
export function exportSingleForecastPDF(forecast: BudgetForecastOutput) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm
  let y = margin;

  // 1. Top Decorative Bar
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin, y, contentWidth, 20, 'F');

  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('GOVBUDGET AI — PUBLIC FINANCIAL SURVEILLANCE SYSTEM', margin + 6, y + 8);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('STATUTORY BUDGET MONITORING & AI-POWERED EXPENDITURE FORECAST REPORT', margin + 6, y + 14);

  y += 24;

  // 2. Document Title & Sub-header
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('AI Scheme Budget Forecast & Outlay Summary', margin, y);

  y += 6;
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.setFont('helvetica', 'normal');
  const dateStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  doc.text(`Generated: ${dateStr} | Financial Year: ${forecast.financialYear} | Ref: FCAST-${forecast.scheme.substring(0, 6).toUpperCase()}`, margin, y);

  y += 4;
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.line(margin, y, margin + contentWidth, y);

  y += 6;

  // 3. Scheme Profile Card
  doc.setFillColor(248, 250, 252); // slate-50
  doc.roundedRect(margin, y, contentWidth, 18, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 18, 2, 2, 'D');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Scheme Name:', margin + 4, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(forecast.scheme.substring(0, 60), margin + 30, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Department:', margin + 4, y + 12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(forecast.department, margin + 30, y + 12);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('AI Engine:', margin + 115, y + 12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(37, 99, 235);
  doc.text(`${forecast.modelUsed} (${forecast.confidenceScore}% Conf.)`, margin + 135, y + 12);

  y += 23;

  // 4. Executive KPI Grid (4 Metrics)
  const colWidth = (contentWidth - 6) / 4; // ~44mm each
  const statusInfo = getStatusDetails(forecast.forecastedStatus);

  // Box 1: Approved Allocation
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, colWidth, 22, 1.5, 1.5, 'F');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('APPROVED ALLOCATION', margin + 3, y + 5);
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(formatPdfCroreLakh(forecast.allocatedAmount), margin + 3, y + 12);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Legislative Ceiling', margin + 3, y + 18);

  // Box 2: Current Disbursed
  const col2X = margin + colWidth + 2;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(col2X, y, colWidth, 22, 1.5, 1.5, 'F');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('CURRENT DISBURSED', col2X + 3, y + 5);
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235);
  doc.text(formatPdfCroreLakh(forecast.currentDisbursed), col2X + 3, y + 12);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Utilized: ${forecast.currentUtilizationPercentage}%`, col2X + 3, y + 18);

  // Box 3: Projected Year-End Spend
  const col3X = margin + (colWidth + 2) * 2;
  doc.setFillColor(statusInfo.bgColor[0], statusInfo.bgColor[1], statusInfo.bgColor[2]);
  doc.roundedRect(col3X, y, colWidth, 22, 1.5, 1.5, 'F');
  doc.setDrawColor(statusInfo.borderColor[0], statusInfo.borderColor[1], statusInfo.borderColor[2]);
  doc.roundedRect(col3X, y, colWidth, 22, 1.5, 1.5, 'D');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(statusInfo.color[0], statusInfo.color[1], statusInfo.color[2]);
  doc.text('PROJECTED YEAR-END', col3X + 3, y + 5);
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(statusInfo.color[0], statusInfo.color[1], statusInfo.color[2]);
  doc.text(formatPdfCroreLakh(forecast.projectedYearEndSpend), col3X + 3, y + 12);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`Exp. Util: ${forecast.projectedUtilizationPercentage}%`, col3X + 3, y + 18);

  // Box 4: Projected Variance & Status
  const col4X = margin + (colWidth + 2) * 3;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(col4X, y, colWidth, 22, 1.5, 1.5, 'F');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('PROJECTED VARIANCE', col4X + 3, y + 5);
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  const varColor = forecast.projectedVariance >= 0 ? [5, 150, 105] : [220, 38, 38];
  doc.setTextColor(varColor[0], varColor[1], varColor[2]);
  doc.text(formatPdfCroreLakh(forecast.projectedVariance), col4X + 3, y + 12);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Burn: ${formatPdfCroreLakh(forecast.burnRatePerMonth)}/mo`, col4X + 3, y + 18);

  y += 28;

  // 5. Forecast Status Banner
  doc.setFillColor(statusInfo.bgColor[0], statusInfo.bgColor[1], statusInfo.bgColor[2]);
  doc.roundedRect(margin, y, contentWidth, 10, 1.5, 1.5, 'F');
  doc.setDrawColor(statusInfo.borderColor[0], statusInfo.borderColor[1], statusInfo.borderColor[2]);
  doc.roundedRect(margin, y, contentWidth, 10, 1.5, 1.5, 'D');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(statusInfo.color[0], statusInfo.color[1], statusInfo.color[2]);
  doc.text(`FORECAST CLASSIFICATION: ${statusInfo.label}`, margin + 4, y + 6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Trajectory Velocity: ${forecast.burnRateVelocity}`, margin + 120, y + 6.5);

  y += 15;

  // 6. Quarterly Projection Milestones Schedule
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('Quarterly Disbursement Trajectory Schedule', margin, y);

  y += 4;
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 6.5, 'F');

  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('Quarter', margin + 3, y + 4.5);
  doc.text('Target Utilization', margin + 45, y + 4.5);
  doc.text('Projected Spend (INR)', margin + 95, y + 4.5);
  doc.text('Cumulative Outlay (INR)', margin + 145, y + 4.5);

  y += 7;
  forecast.quarterlyBreakdown.forEach((q, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y - 0.5, contentWidth, 6, 'F');
    }
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(q.quarter, margin + 3, y + 3.8);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`${q.utilizationTargetPct}%`, margin + 45, y + 3.8);
    doc.text(formatPdfCroreLakh(q.projectedSpend), margin + 95, y + 3.8);
    doc.text(formatPdfCroreLakh(q.cumulativeSpend), margin + 145, y + 3.8);

    y += 6;
  });

  y += 4;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, margin + contentWidth, y);

  y += 6;

  // 7. Executive AI Synthesis
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('AI Executive Forecast Summary & Assessment', margin, y);

  y += 5;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  const summaryLines = doc.splitTextToSize(forecast.executiveForecastSummary, contentWidth - 4);
  doc.text(summaryLines, margin + 2, y);
  y += summaryLines.length * 4.2 + 3;

  // 8. Risk Horizon Analysis
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('Risk Horizon & Execution Bottleneck Scrutiny', margin, y);

  y += 5;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  const riskLines = doc.splitTextToSize(forecast.riskHorizonAnalysis, contentWidth - 4);
  doc.text(riskLines, margin + 2, y);
  y += riskLines.length * 4.2 + 3;

  // Check if we need page 2 for recommendations and signoff
  if (y > 230) {
    doc.addPage();
    y = margin;
  }

  // 9. Strategic Recommendations & Action Items
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('Actionable Strategic Measures for Finance Department', margin, y);

  y += 5;
  forecast.strategicRecommendations.forEach((rec) => {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    doc.text('•', margin + 2, y);
    const recLines = doc.splitTextToSize(rec, contentWidth - 8);
    doc.text(recLines, margin + 6, y);
    y += recLines.length * 4.2 + 1.5;
  });

  y += 2;

  // Recommended Reallocation / Adjustment Highlight
  if (forecast.recommendedAdjustment) {
    doc.setFillColor(238, 242, 255); // indigo-50
    doc.roundedRect(margin, y, contentWidth, 12, 1.5, 1.5, 'F');
    doc.setDrawColor(199, 210, 254);
    doc.roundedRect(margin, y, contentWidth, 12, 1.5, 1.5, 'D');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(67, 56, 202);
    doc.text('FISCAL ADJUSTMENT RECOMMENDATION:', margin + 4, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(55, 48, 163);
    const adjLines = doc.splitTextToSize(forecast.recommendedAdjustment, contentWidth - 8);
    doc.text(adjLines, margin + 4, y + 9);
    y += 16;
  }

  // 10. Statutory Disclaimer & Certification Footer Box
  if (y > 250) {
    doc.addPage();
    y = margin;
  }

  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y, margin + contentWidth, y);
  y += 4;

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  const disclaimerText = `${forecast.disclaimer} Calculations verified deterministically by GovBudget AI Fiscal Engine. Powered by Google Gemini AI Model: ${forecast.modelUsed}.`;
  const discLines = doc.splitTextToSize(disclaimerText, contentWidth);
  doc.text(discLines, margin, y);

  y += discLines.length * 3 + 4;
  doc.setFont('helvetica', 'bold');
  doc.text(`Official Statutory Record — GovBudget AI Platform • Page 1 of ${doc.getNumberOfPages()}`, margin, y);

  // Generate clean filename
  const cleanScheme = forecast.scheme.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 25);
  const today = new Date().toISOString().split('T')[0];
  const filename = `GovBudget_AI_Forecast_${cleanScheme}_${today}.pdf`;

  doc.save(filename);
  return filename;
}

/**
 * Generate and export a Consolidated Multi-Scheme Portfolio Forecast Summary PDF
 */
export function exportConsolidatedForecastsPDF(
  consolidated: ConsolidatedForecastSummary,
  forecasts: BudgetForecastOutput[]
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Header Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentWidth, 22, 'F');

  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('GOVBUDGET AI — PUBLIC FINANCIAL SURVEILLANCE SYSTEM', margin + 6, y + 8);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('CONSOLIDATED STATE BUDGET FORECAST & EXPENDITURE OUTLOOK SUMMARY REPORT', margin + 6, y + 15);

  y += 26;

  // Title
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('Executive Macro Budget Forecast & Fiscal Variance Ledger', margin, y);

  y += 5;
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  const dateStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  doc.text(`Generated on: ${dateStr} | Financial Year 2025-26 | Schemes Analyzed: ${consolidated.schemesCount}`, margin, y);

  y += 4;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, margin + contentWidth, y);

  y += 6;

  // Macro Portfolio Metrics Grid
  const colWidth = (contentWidth - 6) / 4;

  // 1. Total Approved Allocation
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, colWidth, 22, 1.5, 1.5, 'F');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL ALLOCATED', margin + 3, y + 5);
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(formatPdfCroreLakh(consolidated.totalAllocated), margin + 3, y + 12);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('State Legislative Grants', margin + 3, y + 18);

  // 2. Disbursed To Date
  const col2X = margin + colWidth + 2;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(col2X, y, colWidth, 22, 1.5, 1.5, 'F');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL DISBURSED', col2X + 3, y + 5);
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235);
  doc.text(formatPdfCroreLakh(consolidated.totalDisbursed), col2X + 3, y + 12);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  const currUtil = consolidated.totalAllocated > 0
    ? ((consolidated.totalDisbursed / consolidated.totalAllocated) * 100).toFixed(1)
    : '0';
  doc.text(`Current Util: ${currUtil}%`, col2X + 3, y + 18);

  // 3. Projected Year-End Outlay
  const col3X = margin + (colWidth + 2) * 2;
  doc.setFillColor(238, 242, 255);
  doc.roundedRect(col3X, y, colWidth, 22, 1.5, 1.5, 'F');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(67, 56, 202);
  doc.text('PROJECTED OUTLAY', col3X + 3, y + 5);
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(67, 56, 202);
  doc.text(formatPdfCroreLakh(consolidated.totalProjectedSpend), col3X + 3, y + 12);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text(`Projected Util: ${consolidated.projectedUtilizationPercentage}%`, col3X + 3, y + 18);

  // 4. Net Treasury Variance
  const col4X = margin + (colWidth + 2) * 3;
  const netVar = consolidated.netVariance;
  const isPositiveSurplus = netVar >= 0;
  doc.setFillColor(isPositiveSurplus ? 236 : 254, isPositiveSurplus ? 253 : 242, isPositiveSurplus ? 245 : 242);
  doc.roundedRect(col4X, y, colWidth, 22, 1.5, 1.5, 'F');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(isPositiveSurplus ? 5 : 220, isPositiveSurplus ? 150 : 38, isPositiveSurplus ? 105 : 38);
  doc.text('NET VARIANCE', col4X + 3, y + 5);
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.text(formatPdfCroreLakh(netVar), col4X + 3, y + 12);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(isPositiveSurplus ? 'Projected Surplus' : 'Projected Deficit', col4X + 3, y + 18);

  y += 28;

  // Portfolio Risk Heatmap Summary Bar
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth, 12, 1.5, 1.5, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 12, 1.5, 1.5, 'D');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('PORTFOLIO STATUS CLASSIFICATION:', margin + 4, y + 7);

  doc.setFontSize(8);
  doc.setTextColor(5, 150, 105);
  doc.text(`• Optimal: ${consolidated.statusCounts.onTrack}`, margin + 68, y + 7);

  doc.setTextColor(217, 119, 6);
  doc.text(`• Surplus Risk: ${consolidated.statusCounts.surplus}`, margin + 100, y + 7);

  doc.setTextColor(234, 88, 12);
  doc.text(`• Deficit Warning: ${consolidated.statusCounts.deficit}`, margin + 138, y + 7);

  doc.setTextColor(220, 38, 38);
  doc.text(`• Breach Alert: ${consolidated.statusCounts.breach}`, margin + 172, y + 7);

  y += 18;

  // Scheme Breakdown Table
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('Departmental Schemes AI Forecast Ledger', margin, y);

  y += 4;
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentWidth, 7, 'F');

  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('Scheme Name', margin + 3, y + 4.8);
  doc.text('Dept', margin + 60, y + 4.8);
  doc.text('Allocated', margin + 85, y + 4.8);
  doc.text('Disbursed', margin + 112, y + 4.8);
  doc.text('Projected Spend', margin + 138, y + 4.8);
  doc.text('Exp. %', margin + 168, y + 4.8);

  y += 7.5;

  forecasts.forEach((item, idx) => {
    if (y > 272) {
      doc.addPage();
      y = margin;

      // Repeat Table Header on next page
      doc.setFillColor(15, 23, 42);
      doc.rect(margin, y, contentWidth, 7, 'F');
      doc.setFontSize(7);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('Scheme Name', margin + 3, y + 4.8);
      doc.text('Dept', margin + 60, y + 4.8);
      doc.text('Allocated', margin + 85, y + 4.8);
      doc.text('Disbursed', margin + 112, y + 4.8);
      doc.text('Projected Spend', margin + 138, y + 4.8);
      doc.text('Exp. %', margin + 168, y + 4.8);
      y += 7.5;
    }

    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y - 0.5, contentWidth, 6, 'F');
    }

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(item.scheme.substring(0, 32), margin + 3, y + 3.8);

    doc.setTextColor(71, 85, 105);
    doc.text(item.department.substring(0, 14), margin + 60, y + 3.8);
    doc.text(formatPdfCroreLakh(item.allocatedAmount), margin + 85, y + 3.8);
    doc.text(formatPdfCroreLakh(item.currentDisbursed), margin + 112, y + 3.8);

    const statDetails = getStatusDetails(item.forecastedStatus);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(statDetails.color[0], statDetails.color[1], statDetails.color[2]);
    doc.text(formatPdfCroreLakh(item.projectedYearEndSpend), margin + 138, y + 3.8);
    doc.text(`${item.projectedUtilizationPercentage}%`, margin + 168, y + 3.8);

    y += 6;
  });

  y += 6;
  if (y > 255) {
    doc.addPage();
    y = margin;
  }

  // Statutory Footer
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y, margin + contentWidth, y);
  y += 5;

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Consolidated Statutory Report generated for Ministerial Committee on Public Accounts. Projections calculated by GovBudget AI Fiscal Engine with Gemini 3.8 Flash analysis.',
    margin,
    y
  );

  const today = new Date().toISOString().split('T')[0];
  const filename = `GovBudget_AI_Portfolio_Forecasts_Summary_${today}.pdf`;
  doc.save(filename);
  return filename;
}

/**
 * Export Financial Advisory Insight to a formatted PDF summary document
 */
export function exportAdvisoryInsightPDF(insight: any, budget?: any) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Header Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentWidth, 20, 'F');

  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('GOVBUDGET AI — PUBLIC FINANCIAL SURVEILLANCE SYSTEM', margin + 6, y + 8);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('EXECUTIVE FINANCIAL ADVISORY & RISK AUDIT REPORT', margin + 6, y + 14);

  y += 25;

  // Document Title
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('Executive Financial Advisory & Anomaly Scrutiny', margin, y);

  y += 5;
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  const dateStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  doc.text(`Generated: ${dateStr} | Engine: ${insight.modelUsed || 'gemini-3.8-flash'} | Priority: ${insight.priority}`, margin, y);

  y += 4;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, margin + contentWidth, y);
  y += 6;

  // Scheme Telemetry Card if available
  if (budget) {
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, contentWidth, 16, 1.5, 1.5, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, 16, 1.5, 1.5, 'D');

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('Target Scheme:', margin + 4, y + 6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text((budget.scheme || 'State Public Scheme').substring(0, 55), margin + 28, y + 6);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('Allocation:', margin + 4, y + 12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(formatPdfCroreLakh(budget.allocatedAmount || 0), margin + 28, y + 12);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('Disbursed:', margin + 75, y + 12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(37, 99, 235);
    doc.text(
      `${formatPdfCroreLakh(budget.totalSpent || 0)} (${budget.utilizationPercentage || 0}%)`,
      margin + 93,
      y + 12
    );

    y += 21;
  }

  // Executive Summary Box
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('Executive Summary', margin, y);
  y += 5;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  const execLines = doc.splitTextToSize(insight.executiveSummary, contentWidth - 4);
  doc.text(execLines, margin + 2, y);
  y += execLines.length * 4.4 + 4;

  // Financial Risk Assessment Box
  doc.setFillColor(254, 252, 232); // amber-50
  doc.roundedRect(margin, y, contentWidth, 24, 1.5, 1.5, 'F');
  doc.setDrawColor(253, 230, 138);
  doc.roundedRect(margin, y, contentWidth, 24, 1.5, 1.5, 'D');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(180, 83, 9);
  doc.text('FINANCIAL RISK ASSESSMENT:', margin + 4, y + 6);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 53, 15);
  const riskLines = doc.splitTextToSize(insight.riskSummary, contentWidth - 8);
  doc.text(riskLines, margin + 4, y + 12);
  y += 28;

  // Institutional Cause Box
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('Probable Institutional Cause', margin, y);
  y += 5;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  const causeLines = doc.splitTextToSize(insight.possibleExplanation, contentWidth - 4);
  doc.text(causeLines, margin + 2, y);
  y += causeLines.length * 4.4 + 4;

  // Recommended Administrative Action Box
  doc.setFillColor(236, 253, 245); // emerald-50
  doc.roundedRect(margin, y, contentWidth, 24, 1.5, 1.5, 'F');
  doc.setDrawColor(167, 243, 208);
  doc.roundedRect(margin, y, contentWidth, 24, 1.5, 1.5, 'D');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105);
  doc.text('RECOMMENDED ADMINISTRATIVE ACTION:', margin + 4, y + 6);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(6, 78, 59);
  const actionLines = doc.splitTextToSize(insight.recommendedAction, contentWidth - 8);
  doc.text(actionLines, margin + 4, y + 12);
  y += 28;

  // Statutory Footer & Disclaimer
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, margin + contentWidth, y);
  y += 5;

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  const disc = doc.splitTextToSize(
    `${insight.disclaimer} Analysis processed via ${insight.modelUsed || 'gemini-3.8-flash'}. GovBudget AI Statutory Governance.`,
    contentWidth
  );
  doc.text(disc, margin, y);

  const today = new Date().toISOString().split('T')[0];
  const filename = `GovBudget_AI_Advisory_${today}.pdf`;
  doc.save(filename);
  return filename;
}

