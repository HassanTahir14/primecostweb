"use client";

import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "@/components/Sidebar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import {
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";
import { BarChart3, Box, Users, PenTool, ChevronDown, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AppDispatch, RootState } from "@/store/store";
import { fetchAllItems } from "@/store/itemsSlice";
import {
  fetchProfitMargin,
  clearRecipeReportError,
} from "@/store/recipeReportsSlice";
import { fetchAllEmployees } from "@/store/employeeSlice";
import { fetchAllPurchaseOrders } from "@/store/purchaseOrderSlice";
import { fetchAllSuppliers } from "@/store/supplierSlice";
import api from "@/store/api";
import PageLayout from '@/components/PageLayout';
import { useTranslation } from '@/context/TranslationContext';

// URL for world map TopoJSON data
const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

// Add this type definition before the Dashboard component
type GeographiesChildrenProps = {
  geographies: Array<{
    rsmKey: string;
    properties: {
      name: string;
      [key: string]: any;
    };
    [key: string]: any;
  }>;
};

// --- Helper Function to get today's date in YYYY-MM-DD format ---
const getTodaysDate = () => {
  return new Date().toISOString().split("T")[0];
};

interface ProfitMarginEntry {
  recipeName: string;
  profitMarginPerPortion: string;
  costPerRecipe: string;
}

export default function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { t, isRTL } = useTranslation();

  // --- Date Range State ---
  const [startDate, setStartDate] = useState(getTodaysDate()); // Default to today
  const [endDate, setEndDate] = useState(getTodaysDate()); // Default to today
  const [mainRecipes, setMainRecipes] = useState([]);
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const main_recipes = await api.post('/inventory/view/prepared-main-recipe', {page: 0, size: 1000, sortBy: 'preparedDate', direction: 'desc'});
        setMainRecipes(main_recipes.data.preparedMainRecipeList);
      } catch (error) {
        console.error('Error fetching recipes:', error);
      }
    };

    fetchRecipes();
  }, []);

  // --- Selectors ---
  const {
    items,
    status: itemsStatus,
    error: itemsError,
  } = useSelector((state: RootState) => state.items);
  const itemsLoading = itemsStatus === "loading";
  const {
    data: profitMarginDataRaw, // Rename to avoid conflict
    loading: profitMarginLoading,
    error: profitMarginError,
  } = useSelector((state: RootState) => state.recipeReports.profitMargin);
  const { employees, loading: employeesLoading, error: employeesError } = useSelector(
    (state: RootState) => state.employee
  );
  const { orders: purchaseOrders, loading: ordersLoading, error: ordersError } = useSelector(
    (state: RootState) => state.purchaseOrder
  );
  const { suppliers, loading: suppliersLoading, error: suppliersError } = useSelector(
    (state: RootState) => state.supplier
  );

  // Count only active employees
  const activeEmployeesCount = useMemo(() => {
    if (!employees) return 0;
    return employees.filter(employee => employee.employeeDetailsDTO?.active === true).length;
  }, [employees]);

  // --- Fetch Data ---
  useEffect(() => {
    // Fetch items on initial load
    dispatch(fetchAllItems({ page: 0, size: 1000, sortBy: 'name', direction: 'asc', searchQuery: ''}));
    // Fetch employees on initial load
    dispatch(fetchAllEmployees());
    // Fetch purchase orders on initial load
    dispatch(fetchAllPurchaseOrders({ page: 0, size: 1000, sortBy: 'id', direction: 'ASC' }));
    // Fetch suppliers on initial load
    dispatch(fetchAllSuppliers());
  }, [dispatch]);

  useEffect(() => {
    // Fetch profit margin data when dates change
    if (startDate && endDate) {
      dispatch(clearRecipeReportError("profitMargin"));
      dispatch(fetchProfitMargin({ startDate: "2024-02-27", endDate: new Date().toISOString().split("T")[0], sortBy: "preparedDate", direction: "asc", page: 0, size: 1000 })); // Or another relevant sortBy
    }
  }, [dispatch, startDate, endDate]);

  // --- Process Data (useMemo for optimization) ---

  // Top Suppliers Calculation (using purchase orders)
  const topSuppliers = useMemo(() => {
    if (!purchaseOrders || purchaseOrders.length === 0) return [];
    
    // Count occurrences of each supplier
    const supplierCounts: { [key: string]: number } = {};
    purchaseOrders.forEach((order) => {
      const supplierId = order.supplierId;
      supplierCounts[supplierId] = (supplierCounts[supplierId] || 0) + 1;
    });

    // Match with supplier details and calculate percentages
    const totalOrders = purchaseOrders.length;
    const sortedSuppliers = Object.entries(supplierCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 4)
      .map(([supplierId, count]) => {
        const supplier = suppliers.find(s => s.supplierId === parseInt(supplierId));
        return {
          name: supplier?.name || 'Unknown Supplier',
          percentage: totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0,
        };
      });

    return sortedSuppliers;
  }, [purchaseOrders, suppliers]);

  // Country Origin Calculation
  const countryOrigins = useMemo(() => {
    if (!items || items.length === 0) return [];
    const countries = new Set<string>();
    items.forEach((item) => {
      // Ensure countryOrigin is a non-empty string before adding
      if (
        item.countryOrigin &&
        typeof item.countryOrigin === "string" &&
        item.countryOrigin.trim()
      ) {
        countries.add(item.countryOrigin.trim());
      }
    });
    return Array.from(countries);
  }, [items]);

  // Calculate approved purchase orders count
  const approvedPurchaseOrdersCount = useMemo(() => {
    if (!purchaseOrders) return 0;
    return purchaseOrders.filter(order => order.tokenStatus === 'APPROVED').length;
  }, [purchaseOrders]);

  // Profit Margin Chart Data Transformation
  const profitChartData = useMemo(() => {
    const details = (profitMarginDataRaw as any)?.details;
    if (!Array.isArray(details) || details.length === 0) return [];

    // Group by recipeName like the Dart code does
    const grouped: { [key: string]: ProfitMarginEntry[] } = details.reduce((acc: { [key: string]: ProfitMarginEntry[] }, item: ProfitMarginEntry) => {
      const name = item.recipeName || 'Unknown';
      if (!acc[name]) {
        acc[name] = [];
      }
      acc[name].push(item);
      return acc;
    }, {});

    // Calculate totals for each group
    return Object.entries(grouped).map(([recipeName, entries]) => {
      const totalCostPerRecipe = entries.reduce((sum: number, e: ProfitMarginEntry) => {
        return sum + (parseFloat(e.costPerRecipe) || 0);
      }, 0);

      return {
        category: recipeName,
        costPerRecipe: totalCostPerRecipe,
      };
    });
  }, [profitMarginDataRaw]);

  // --- Handlers ---
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
  };

  // TODO: Add display for itemsError and profitMarginError if needed

  return (
    <PageLayout title={t('dashboard.title')}>
      <div className="p-4 sm:p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl md:text-2xl font-bold text-[#1a2b3c]">
              {t('dashboard.title')}
            </h1>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm:items-center">
            <span className="text-gray-600 text-xs md:text-sm whitespace-nowrap">
              {t('dashboard.dateRange.label')}
            </span>
            <div className="flex gap-2 sm:gap-4 items-center w-full sm:w-auto">
              <input
                type="date"
                className="border rounded-full px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm w-full sm:w-auto"
                value={startDate}
                onChange={handleStartDateChange}
              />
              <span className="text-gray-600 text-xs md:text-sm">{t('dashboard.dateRange.to')}</span>
              <input
                type="date"
                className="border rounded-full px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm w-full sm:w-auto"
                value={endDate}
                onChange={handleEndDateChange}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-6">
          <div className="bg-[#FFE6E6] p-4 sm:p-5 md:p-6 rounded-2xl shadow-lg">
            <div className="bg-[#FF6B6B] w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mb-3 md:mb-4">
              <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold mb-1">
              {mainRecipes?.length || "-"}
            </h2>
            <p className="text-gray-600 text-xs md:text-sm mb-1">
              {t('dashboard.stats.preparedRecipes')}
            </p>
          </div>

          <div className="bg-[#FFF2E6] p-4 sm:p-5 md:p-6 rounded-2xl shadow-lg">
            <div className="bg-[#FF9F6B] w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mb-3 md:mb-4">
              <Box className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold mb-1">
              {items?.length || "-"}
            </h2>
            <p className="text-gray-600 text-xs md:text-sm mb-1">
              {t('dashboard.stats.totalItems')}
            </p>
          </div>

          <div className="bg-[#E6FFE6] p-4 sm:p-5 md:p-6 rounded-2xl shadow-lg">
            <div className="bg-[#4CD964] w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mb-3 md:mb-4">
              <PenTool className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold mb-1">
              {ordersLoading ? '...' : approvedPurchaseOrdersCount ?? '-'}
            </h2>
            <p className="text-gray-600 text-xs md:text-sm mb-1">
              {t('dashboard.stats.totalOrders')}
            </p>
          </div>

          <div className="bg-[#F2E6FF] p-4 sm:p-5 md:p-6 rounded-2xl shadow-lg">
            <div className="bg-[#B66BFF] w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mb-3 md:mb-4">
              <Users className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold mb-1">
              {employeesLoading ? '...' : activeEmployeesCount ?? '-'}
            </h2>
            <p className="text-gray-600 text-xs md:text-sm mb-1">
              {t('dashboard.stats.totalEmployees')}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-sm mb-6">
          <h2 className="text-base md:text-lg font-bold mb-4 md:mb-6">
            {t('dashboard.recipeProfitability.title')}
          </h2>
          <div className="w-full h-[300px] md:h-[400px]">
            {profitMarginLoading ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                {t('dashboard.recipeProfitability.loading')}
              </div>
            ) : profitChartData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                {t('dashboard.recipeProfitability.noData')}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={profitChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="category"
                    fontSize={10}
                    interval={0}
                    height={80}
                    tick={function CustomTick({ x, y, payload }) {
                      const name = payload.value.length > 12 ? payload.value.slice(0, 12) + '…' : payload.value;
                      return (
                        <g transform={`translate(${x},${y})`}>
                          <text
                            x={0}
                            y={0}
                            dy={16}
                            textAnchor="end"
                            fill="#666"
                            fontSize={10}
                            transform="rotate(-60)"
                          >
                            {name}
                          </text>
                        </g>
                      );
                    }}
                  />
                  <YAxis
                    fontSize={10}
                    tick={{ fontWeight: 'bold' }}
                    domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.2)]}
                  />
                  <Tooltip 
                    formatter={(value: number) => `$${value.toFixed(2)}`}
                    labelFormatter={(label) => `Recipe: ${label}`}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: "10px" }} 
                    verticalAlign="bottom"
                  />
                  <Bar
                    dataKey="profitMargin"
                    name={t('dashboard.recipeProfitability.profitMargin')}
                    fill="#4CAF50"
                    barSize={35}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="costPerRecipe" 
                    name={t('dashboard.recipeProfitability.costPerRecipe')}
                    fill="#FF9800"
                    barSize={35}
                    radius={[4, 4, 0, 0]}
                  >
                    <LabelList 
                      dataKey="costPerRecipe" 
                      position="top" 
                      formatter={(value: number) => `$${value.toFixed(2)}`}
                      style={{ fontSize: '10px', fontWeight: 'bold' }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-sm mb-6">
          <h2 className="text-base md:text-lg font-bold mb-4 md:mb-6">
            {t('dashboard.reports.title')}
          </h2>
          <div className="flex flex-wrap gap-2 md:gap-4">
            {[
              { name: t('dashboard.reports.nonConformance'), path: "/non-conformance" },
              { name: t('dashboard.reports.recipe'), path: "/reports/recipe" },
              { name: t('dashboard.reports.purchase'), path: "/reports/purchase" },
              { name: t('dashboard.reports.employee'), path: "/reports/employee" },
              { name: t('dashboard.reports.transfer'), path: "/reports/transfer" },
            ].map((report) => (
              <Link
                key={report.path}
                href={report.path}
                passHref
                legacyBehavior
              >
                <a className="bg-[#339A89] text-white px-4 md:px-6 py-1.5 md:py-2 rounded-full hover:bg-[#2b8274] transition-colors text-xs md:text-sm no-underline">
                  {report.name}
                </a>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 md:mb-6">
              <h2 className="text-base md:text-lg font-bold">{t('dashboard.suppliers.title')}</h2>
            </div>
            {itemsLoading ? (
              <div className="text-gray-500">{t('dashboard.suppliers.loading')}</div>
            ) : topSuppliers.length > 0 ? (
              topSuppliers.map((supplier, index) => (
                <div key={supplier.name} className="mb-4 last:mb-0">
                  <div className="flex justify-between mb-2">
                    <span className="text-xs md:text-sm truncate pr-2" title={supplier.name}>{index + 1}. {supplier.name}</span>
                    <span className="text-[#339A89] rounded-full border border-[#339A89] px-3 md:px-4 py-1 text-xs md:text-sm flex-shrink-0">
                      {supplier.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 md:h-2">
                    <div
                      className="bg-[#339A89] h-1.5 md:h-2 rounded-full"
                      style={{ width: `${supplier.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-500">{t('dashboard.suppliers.noData')}</div>
            )}
          </div>

          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 md:mb-6">
              <h2 className="text-base md:text-lg font-bold">{t('dashboard.countryOrigin.title')}</h2>
            </div>
            <div className="h-[350px] md:h-[450px] w-full border rounded-lg overflow-hidden">
              {itemsLoading ? (
                <div className="flex items-center justify-center h-full text-gray-500">{t('dashboard.countryOrigin.loading')}</div>
              ) : (
                <ComposableMap projection="geoMercator" projectionConfig={{ scale: 100 }}>
                  <Geographies geography={geoUrl}>
                    {({ geographies }: GeographiesChildrenProps) =>
                      geographies.map((geo: any) => {
                        const countryName = geo.properties?.name || '';
                        
                        const isHighlighted = countryOrigins.some(origin => {
                          if (typeof origin !== 'string') return false;
                          
                          const normalizedOrigin = origin.trim().toLowerCase();
                          const normalizedCountryName = countryName.toLowerCase();
                          
                          if (normalizedOrigin === 'ae' && normalizedCountryName.includes('emirates')) {
                            return true;
                          }
                          if (normalizedOrigin === 'sa' && normalizedCountryName.includes('saudi')) {
                            return true;
                          }
                          
                          return (
                            normalizedCountryName.includes(normalizedOrigin) ||
                            normalizedOrigin.includes(normalizedCountryName)
                          );
                        });

                        return (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            fill={isHighlighted ? "#339A89" : "#EAEAEC"}
                            stroke="#D6D6DA"
                            style={{
                              default: { outline: "none" },
                              hover: { fill: isHighlighted ? "#2b8274" : "#cfcfcf", outline: "none" },
                              pressed: { fill: isHighlighted ? "#21685d" : "#b8b8b8", outline: "none" },
                            }}
                          />
                        );
                      })
                    }
                  </Geographies>
                </ComposableMap>
              )}
            </div>
            <div className="mt-4">
              {itemsLoading ? (
                <div className="text-gray-400 text-xs">{t('dashboard.countryOrigin.loading')}</div>
              ) : countryOrigins.length > 0 ? (
                <div className="text-gray-500 text-xs">
                  <p className="font-medium mb-1">{t('dashboard.countryOrigin.countriesFound')} ({countryOrigins.length}):</p>
                  <p className="break-words">{countryOrigins.join(", ")}</p>
                </div>
              ) : (
                <div className="text-gray-400 text-xs">{t('dashboard.countryOrigin.noData')}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
} 
