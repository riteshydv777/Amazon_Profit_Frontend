import React from 'react';

export default function DetailedProfitReport({ reportData }) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en-IN', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const formatPercentage = (value) => {
    return `${(value || 0).toFixed(2)}%`;
  };

  if (!reportData) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">No report data available</p>
      </div>
    );
  }

  // Ensure all required fields exist with defaults - map backend field names
  const data = {
    totalSales: reportData.totalSales || reportData.totalRevenue || 0,
    shippingAndFees: reportData.shippingAndFees || 0,
    netSettlement: reportData.netSettlement || reportData.totalSettlement || 0,
    otherCharges: reportData.otherCharges || 0,
    purchaseCost: reportData.purchaseCost || reportData.totalCost || 0,
    profit: reportData.profit || reportData.totalProfit || 0,
    profitMargin: reportData.profitMargin || reportData.margin || 0,
    dateFrom: reportData.dateFrom,
    dateTo: reportData.dateTo,
    otherChargesBreakdown: reportData.otherChargesBreakdown,
    orderDetails: reportData.orderDetails,
    fulfillmentDetails: reportData.fulfillmentDetails,
    returnsDetails: reportData.returnsDetails,
    skuWiseDetails: reportData.skuWiseDetails || [],
    bankTransfers: reportData.bankTransfers || []
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-6">
      {/* Header with Date Range */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-2">Profit Analysis Report</h1>
        <p className="text-blue-100 text-lg">
          Validating Profits from {formatDate(data.dateFrom)} to {formatDate(data.dateTo)}
        </p>
      </div>

      {/* Main Financial Summary */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
        <div className="divide-y divide-slate-100">
          <div className="flex justify-between items-center p-6 hover:bg-slate-50 transition-colors">
            <span className="text-slate-700 font-semibold text-lg">Sales</span>
            <span className="text-2xl font-bold text-slate-900">{formatCurrency(data.totalSales)}</span>
          </div>

          <div className="flex justify-between items-center p-6 hover:bg-slate-50 transition-colors">
            <span className="text-slate-700 font-semibold text-lg">Shipping and Fees</span>
            <span className="text-2xl font-bold text-blue-600">
              {formatCurrency(data.shippingAndFees)}
              <span className="text-sm text-slate-500 ml-2">
                ({formatPercentage((data.shippingAndFees / data.totalSales) * 100)})
              </span>
            </span>
          </div>

          <div className="flex justify-between items-center p-6 hover:bg-slate-50 transition-colors">
            <span className="text-slate-700 font-semibold text-lg">Net Settlement</span>
            <span className="text-2xl font-bold text-green-600">
              {formatCurrency(data.netSettlement)}
              <span className="text-sm text-slate-500 ml-2">
                ({formatPercentage((data.netSettlement / data.totalSales) * 100)})
              </span>
            </span>
          </div>

          <div className="flex justify-between items-center p-6 hover:bg-slate-50 transition-colors">
            <span className="text-slate-700 font-semibold text-lg">Other Charges</span>
            <span className="text-2xl font-bold text-orange-600">
              {formatCurrency(data.otherCharges)}
              <span className="text-sm text-slate-500 ml-2">
                ({formatPercentage((data.otherCharges / data.totalSales) * 100)})
              </span>
            </span>
          </div>

          <div className="flex justify-between items-center p-6 hover:bg-slate-50 transition-colors">
            <span className="text-slate-700 font-semibold text-lg">Purchase Cost</span>
            <span className="text-2xl font-bold text-purple-600">{formatCurrency(data.purchaseCost)}</span>
          </div>

          <div className="flex justify-between items-center p-8 bg-gradient-to-r from-green-50 to-emerald-50 border-t-4 border-green-500">
            <span className="text-slate-800 font-bold text-2xl">Profit</span>
            <span className={`text-4xl font-black ${data.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(data.profit)}
            </span>
          </div>
        </div>
      </div>

      {/* Other Charges Breakdown */}
      {data.otherChargesBreakdown && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span className="text-orange-500">📊</span>
            Other Charges Breakdown
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-2xl">💰</span>
                <span className="text-slate-700 font-medium">Cost of Advertising</span>
              </div>
              <span className="text-lg font-bold text-slate-900">
                {formatCurrency(data.otherChargesBreakdown.costOfAdvertising)}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📦</span>
                <span className="text-slate-700 font-medium">FBA Inbound Pickup Service</span>
              </div>
              <span className="text-lg font-bold text-slate-900">
                {formatCurrency(data.otherChargesBreakdown.fbaInboundPickupService)}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-2xl">↩️</span>
                <span className="text-slate-700 font-medium">FBA Removal Order: Return Fee</span>
              </div>
              <span className="text-lg font-bold text-slate-900">
                {formatCurrency(data.otherChargesBreakdown.fbaRemovalOrderReturnFee)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Order Details */}
      {data.orderDetails && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span className="text-blue-500">📋</span>
            Order Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
              <span className="text-slate-700 font-medium">Total Orders</span>
              <span className="text-2xl font-bold text-blue-600">{data.orderDetails.totalOrders}</span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
              <span className="text-slate-700 font-medium">Delivered</span>
              <span className="text-2xl font-bold text-green-600">
                {data.orderDetails.deliveredOrders}
                <span className="text-sm ml-2">({formatPercentage(data.orderDetails.deliveryPercentage)})</span>
              </span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg">
              <span className="text-slate-700 font-medium">Courier Return</span>
              <span className="text-2xl font-bold text-orange-600">
                {data.orderDetails.courierReturn}
                <span className="text-sm ml-2">({formatPercentage(data.orderDetails.courierReturnPercentage)})</span>
              </span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
              <span className="text-slate-700 font-medium">Customer Return</span>
              <span className="text-2xl font-bold text-red-600">
                {data.orderDetails.customerReturn}
                <span className="text-sm ml-2">({formatPercentage(data.orderDetails.customerReturnPercentage)})</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Fulfillment Details */}
      {data.fulfillmentDetails && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span className="text-purple-500">🚚</span>
            Fulfillment Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
              <span className="text-slate-700 font-medium">Easy Ship Order Count</span>
              <span className="text-2xl font-bold text-blue-600">{data.fulfillmentDetails.easyShipOrderCount}</span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
              <span className="text-slate-700 font-medium">FBA Order Count</span>
              <span className="text-2xl font-bold text-purple-600">{data.fulfillmentDetails.fbaOrderCount}</span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
              <span className="text-slate-700 font-medium">Self Ship Order Count</span>
              <span className="text-2xl font-bold text-green-600">{data.fulfillmentDetails.selfShipOrderCount}</span>
            </div>
          </div>
        </div>
      )}

      {/* Returns Details */}
      {data.returnsDetails && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span className="text-red-500">↩️</span>
            Returns Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
              <span className="text-slate-700 font-medium">Customer Return</span>
              <span className="text-2xl font-bold text-red-600">
                {reportData.returnsDetails.customerReturnCount}
                <span className="text-sm ml-2">({formatPercentage(reportData.returnsDetails.customerReturnPercentage)})</span>
              </span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
              <span className="text-slate-700 font-medium">Customer Return Loss</span>
              <span className="text-2xl font-bold text-red-600">{formatCurrency(reportData.returnsDetails.customerReturnLoss)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Bank Transfers */}
      {data.bankTransfers && data.bankTransfers.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
          <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <span className="text-green-500">🏦</span>
              Bank Transfers
            </h2>
            <p className="text-slate-600 text-sm mt-1">Transfers include Profit month and Follow up month</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase">Account</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-slate-700 uppercase">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="bg-green-50">
                  <td className="px-6 py-4 font-bold text-slate-900">Total</td>
                  <td className="px-6 py-4"></td>
                  <td className="px-6 py-4 text-right text-2xl font-black text-green-600">
                    {formatCurrency(data.bankTransfers.reduce((sum, t) => sum + (t.amount || 0), 0))}
                  </td>
                </tr>
                {data.bankTransfers.map((transfer, index) => (
                  <tr key={index} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-700">{formatDate(transfer.date)}</td>
                    <td className="px-6 py-4 text-slate-700">{transfer.account}</td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900">{formatCurrency(transfer.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SKU Wise Details */}
      {data.skuWiseDetails && data.skuWiseDetails.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
          <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-slate-200 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-indigo-500">📦</span>
                SKU Wise Details
              </h2>
            </div>
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center gap-2 shadow-lg">
              <span>📥</span>
              Download SKU Wise Details
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase">Product</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-slate-700 uppercase">Units Sold</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-slate-700 uppercase">Return</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-slate-700 uppercase">Successful Sale</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-700 uppercase">Cost Price</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-700 uppercase">Settlement</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-700 uppercase">Return Loss</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-700 uppercase">Profit/Loss</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.skuWiseDetails.map((sku, index) => {
                  const isProfit = (sku.totalProfit || 0) >= 0;
                  const rowBgClass = isProfit ? 'hover:bg-green-50/50' : 'hover:bg-red-50/50';
                  
                  return (
                    <tr key={index} className={`${rowBgClass} transition-colors`}>
                      <td className="px-4 py-4">
                        <div>
                          <div className="font-bold text-slate-900">{sku.productName}</div>
                          <div className="text-xs text-slate-500">{sku.sku}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center font-medium text-slate-900">{sku.unitsSold}</td>
                      <td className="px-4 py-4 text-center">
                        <div className="font-medium text-slate-900">{sku.returnCount}</div>
                        <div className="text-xs text-slate-500">({formatPercentage(sku.returnPercentage)})</div>
                      </td>
                      <td className="px-4 py-4 text-center font-medium text-green-600">{sku.successfulSales}</td>
                      <td className="px-4 py-4 text-right font-medium text-slate-900">{formatCurrency(sku.costPrice)}</td>
                      <td className="px-4 py-4 text-right font-medium text-blue-600">{formatCurrency(sku.settlement)}</td>
                      <td className="px-4 py-4 text-right font-medium text-red-600">{formatCurrency(sku.returnLoss)}</td>
                      <td className="px-4 py-4 text-right">
                        <div className={`font-black text-lg ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(sku.totalProfit)}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Download Report Button */}
      <div className="flex justify-center pt-6">
        <button
          onClick={() => window.print()}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-10 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-xl flex items-center gap-3"
        >
          <span className="text-2xl">🖨️</span>
          Print Full Report
        </button>
      </div>
    </div>
  );
}