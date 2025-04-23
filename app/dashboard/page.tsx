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
} from "recharts";
import {
  ComposableMap,
  Geographies,
  Geography,
  GeographiesChildrenArgument,
} from "react-simple-maps";
import { BarChart3, Box, Users, PenTool, ChevronDown } from "lucide-react";
import Link from "next/link";
import { AppDispatch, RootState } from "@/store/store";
import { fetchAllItems } from "@/store/itemsSlice";
import {
  fetchProfitMargin,
  clearRecipeReportError,
} from "@/store/recipeReportsSlice";
import { fetchAllEmployees } from "@/store/employeeSlice";
import { fetchAllPurchaseOrders } from "@/store/purchaseOrderSlice";
import api from "@/store/api";

// URL for world map TopoJSON data
const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

// Dummy data for Profit Margin Chart
const dummyProfitChartData = [
  { name: "Dummy Recipe A", profit: 5.5, cost: 12.0 },
  { name: "Dummy Recipe B", profit: -2.1, cost: 8.5 },
  { name: "Dummy Recipe C", profit: 15.75, cost: 25.25 },
  { name: "Dummy Recipe D", profit: 8.0, cost: 10.0 },
  { name: "Dummy Recipe E", profit: 1.5, cost: 4.0 },
];

// --- Helper Function to get today's date in YYYY-MM-DD format ---
const getTodaysDate = () => {
  return new Date().toISOString().split("T")[0];
};

export default function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  // --- Fetch Data ---
  useEffect(() => {
    // Fetch items on initial load
    dispatch(fetchAllItems({ page: 0, size: 1000 }));
    // Fetch employees on initial load
    dispatch(fetchAllEmployees());
    // Fetch purchase orders on initial load (assuming defaults for page/size/sort)
    dispatch(fetchAllPurchaseOrders({ page: 0, size: 1000, sortBy: 'id', direction: 'ASC' }));
  }, [dispatch]);

  useEffect(() => {
    // Fetch profit margin data when dates change
    if (startDate && endDate) {
      dispatch(clearRecipeReportError("profitMargin"));
      dispatch(fetchProfitMargin({ startDate, endDate, sortBy: "recipeName" })); // Or another relevant sortBy
    }
  }, [dispatch, startDate, endDate]);

  // --- Process Data (useMemo for optimization) ---

  // Top Suppliers Calculation (using itemsBrandName)
  const topSuppliers = useMemo(() => {
    if (!items || items.length === 0) return [];
    const supplierCounts: { [key: string]: number } = {};
    items.forEach((item) => {
      const brandName = item.itemsBrandName || 'Unknown Brand/Supplier';
      supplierCounts[brandName] = (supplierCounts[brandName] || 0) + 1;
    });
    const totalItems = items.length;
    const sortedSuppliers = Object.entries(supplierCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 4);
    return sortedSuppliers.map(([name, count]) => ({
      name,
      percentage: totalItems > 0 ? Math.round((count / totalItems) * 100) : 0,
    }));
  }, [items]);

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
    // Simplify access, using type assertion as a workaround for incorrect state type inference
    // TODO: Fix the type definition in recipeReportsSlice for profitMargin.data
    const details = (profitMarginDataRaw as any)?.details;
    if (!Array.isArray(details) || details.length === 0) return [];

    return details.map((item) => ({
      name: item.recipeName,
      cost: parseFloat(item.costPerPortion) || 0,
      profit: parseFloat(item.profitMarginPerPortion) || 0,
    }));
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
    <div className="flex min-h-screen bg-[#f1fff7]">
      <Sidebar isOpen={isSidebarOpen} onOpenChange={setIsSidebarOpen} />
      
      <div
        className={`flex-1 flex flex-col min-h-screen ${
          isSidebarOpen ? "lg:pl-[400px]" : "pl-16 md:pl-20"
        }`}
      >
        {/* Navbar */}
        <nav className="h-14 md:h-16 border-b bg-white flex items-center justify-end px-4 md:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-7 h-7 md:w-8 md:h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
            </div>
            <span className="text-gray-700 text-xs md:text-sm">
              Walid Sulieman
            </span>
            <ChevronDown className="w-3 h-3 md:w-4 md:h-4 text-gray-600" />
          </div>
        </nav>

        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
            <h1 className="text-xl md:text-2xl font-bold text-[#1a2b3c]">
              Dashboard
            </h1>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm:items-center">
              <span className="text-gray-600 text-xs md:text-sm whitespace-nowrap">
                Select Date Range
              </span>
              <div className="flex gap-2 sm:gap-4 items-center w-full sm:w-auto">
                <input
                  type="date"
                  className="border rounded-full px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm w-full sm:w-auto"
                  value={startDate}
                  onChange={handleStartDateChange}
                />
                <span className="text-gray-600 text-xs md:text-sm">To</span>
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
                Prepared Recipes
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
                Total Items
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
                Total Orders
              </p>
            </div>
            <div className="bg-[#F2E6FF] p-4 sm:p-5 md:p-6 rounded-2xl shadow-lg">
              <div className="bg-[#B66BFF] w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mb-3 md:mb-4">
                <Users className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <h2 className="text-lg md:text-xl lg:text-2xl font-bold mb-1">
                {employeesLoading ? '...' : employees?.length ?? '-'}
              </h2>
              <p className="text-gray-600 text-xs md:text-sm mb-1">
                Total Employee
              </p>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-sm mb-6">
            <h2 className="text-base md:text-lg font-bold mb-4 md:mb-6">
              Recipe Profitability (Dummy Data)
            </h2>
            <div className="w-full h-[300px] md:h-[400px]">
              {profitMarginLoading ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Fetching data...
                </div>
              ) : (
              <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dummyProfitChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="name"
                      fontSize={10}
                      interval={0}
                      angle={-30}
                      textAnchor="end"
                      height={60}
                    />
                  <YAxis fontSize={10} />
                    <Tooltip formatter={(value: number) => value.toFixed(2)} />
                    <Legend wrapperStyle={{ fontSize: "10px" }} />
                    <Bar
                      dataKey="profit"
                      name="Profit Margin / Portion"
                      fill="#2196F3"
                    />
                    <Bar dataKey="cost" name="Cost / Portion" fill="#f44336" />
                </BarChart>
              </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-sm mb-6">
            <h2 className="text-base md:text-lg font-bold mb-4 md:mb-6">
              Reports
            </h2>
            <div className="flex flex-wrap gap-2 md:gap-4">
              {[
                { name: "Non Conformance Report", path: "/non-conformance" },
                { name: "Recipe Report", path: "/reports/recipe" },
                { name: "Purchase Report", path: "/reports/purchase" },
                { name: "Employee Data Report", path: "/reports/employee" },
                { name: "Transfer Report", path: "/reports/transfer" },
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
                <h2 className="text-base md:text-lg font-bold">Top Brands/Suppliers by Item Count</h2>
                <Link href="/suppliers" passHref legacyBehavior>
                  <a className="bg-[#339A89] text-white px-4 md:px-6 py-1.5 md:py-2 rounded-full hover:bg-[#2b8274] transition-colors text-xs md:text-sm w-full sm:w-auto no-underline">
                    View All Suppliers
                  </a>
                </Link>
              </div>
              {itemsLoading ? (
                <div className="text-gray-500">Loading suppliers...</div>
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
                <div className="text-gray-500">No supplier data available.</div>
              )}
            </div>

            <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 md:mb-6">
                <h2 className="text-base md:text-lg font-bold">Items by Country Origin</h2>
              </div>
              <div className="h-[350px] md:h-[450px] w-full border rounded-lg overflow-hidden">
                {itemsLoading ? (
                  <div className="flex items-center justify-center h-full text-gray-500">Loading Map...</div>
                ) : (
                  <ComposableMap projection="geoMercator" projectionConfig={{ scale: 100 }}>
                    <Geographies geography={geoUrl}>
  {({ geographies }: GeographiesChildrenArgument) =>
    geographies.map((geo: any) => {
      // Access the correct property name based on your data structure
      const countryName = geo.properties?.name || '';
      
      const isHighlighted = countryOrigins.some(origin => {
        if (typeof origin !== 'string') return false;
        
        const normalizedOrigin = origin.trim().toLowerCase();
        const normalizedCountryName = countryName.toLowerCase();
        
        // Special case for country codes
        if (normalizedOrigin === 'ae' && normalizedCountryName.includes('emirates')) {
          return true; // Match AE to United Arab Emirates
        }
        if (normalizedOrigin === 'sa' && normalizedCountryName.includes('saudi')) {
          return true; // Match SA to Saudi Arabia
        }
        
        // Main matching logic
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
                  <div className="text-gray-400 text-xs">Loading countries...</div>
                ) : countryOrigins.length > 0 ? (
                  <div className="text-gray-500 text-xs">
                    <p className="font-medium mb-1">Countries Found ({countryOrigins.length}):</p>
                    <p className="break-words">{countryOrigins.join(", ")}</p>
                  </div>
                ) : (
                  <div className="text-gray-400 text-xs">No country of origin data found in items.</div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 
