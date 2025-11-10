// import { useState, useEffect, useMemo } from 'react';
// import { useAuth } from '@/react-app/hooks/useGoogleAuth';
// import { Rocket, ChevronDown, Users, Eye, Clock, Flag, X, Zap, User, TrendingUp, Bot, Send } from 'lucide-react';
// import { useNavigate } from 'react-router';
// import { DayPicker, DateRange as DayPickerRange } from 'react-day-picker';
// import 'react-day-picker/dist/style.css';
// import TrafficSources from '@/react-app/components/TrafficSources';
// import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

// interface GAProperty {
//   id: string;
//   displayName: string;
// }

// interface DateRange {
//   id: string;
//   label: string;
//   startDate: string;
//   endDate: string;
// }

// interface AnalyticsData {
//   metrics: {
//     sessions: number;
//     users: number;
//     pageViews: number;
//     bounceRate: number;
//     avgSessionDuration: number;
//     conversions: number;
//   };
//   chartData: {
//     date: string;
//     sessions: number;
//   }[];
//   trafficSources?: {
//     name: string;
//     value: number;
//   }[];
//   timestamp: string;
//   dateRange?: {
//     startDate: string;
//     endDate: string;
//   };
// }

// type IsoDate = string; // "YYYY-MM-DD"

// function toISODateLocal(d: Date): IsoDate {
//   const y = d.getFullYear();
//   const m = String(d.getMonth() + 1).padStart(2, '0');
//   const day = String(d.getDate()).padStart(2, '0');
//   return `${y}-${m}-${day}`;
// }
// function addDays(d: Date, n: number) {
//   const x = new Date(d);
//   x.setDate(x.getDate() + n);
//   return x;
// }
// function startOfMonth(d: Date) {
//   return new Date(d.getFullYear(), d.getMonth(), 1);
// }
// function endOfMonth(d: Date) {
//   return new Date(d.getFullYear(), d.getMonth() + 1, 0);
// }

// export default function Dashboard() {
//   const { user, logout, isPending, fetchUser } = useAuth();
//   const navigate = useNavigate();

//   // Fetch user on mount
//   useEffect(() => {
//     fetchUser();
//   }, []);

//   // Redirect to home if not logged in
//   useEffect(() => {
//     if (!isPending && !user) navigate('/');
//   }, [user, isPending, navigate]);

//   const [selectedProperty, setSelectedProperty] = useState<string>('');
//   const [selectedDateRange, setSelectedDateRange] = useState<string>('last7days'); // default like GA4
//   const [isPropertyDropdownOpen, setIsPropertyDropdownOpen] = useState(false);
//   const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
//   const [properties, setProperties] = useState<GAProperty[]>([]);
//   const [isLoadingProperties, setIsLoadingProperties] = useState(true);
//   const [propertiesError, setPropertiesError] = useState<string | null>(null);

//   const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
//   const [previousPeriodData, setPreviousPeriodData] = useState<AnalyticsData | null>(null);
//   const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
//   const [analyticsError, setAnalyticsError] = useState<string | null>(null);
//   const [propertyAccessError, setPropertyAccessError] = useState<{ propertyId: string; error: string } | null>(null);

//   const [customRange, setCustomRange] = useState<DayPickerRange | undefined>(undefined);
//   const [appliedCustom, setAppliedCustom] = useState<{ startDate: IsoDate; endDate: IsoDate } | null>(null);

//   // Chatbot state
//   const [chatQuestion, setChatQuestion] = useState<string>('');
//   const [chatAnswer, setChatAnswer] = useState<string>('');
//   const [isLoadingChat, setIsLoadingChat] = useState<boolean>(false);
//   const [chatError, setChatError] = useState<string | null>(null);

//   // TIMEZONE CONFIGURATION - Change this to match your GA4 property timezone
//   const GA4_TIMEZONE = 'America/Los_Angeles'; // Match GA4 API timezone from logs

//   // Local today for UI components (calendar picker)
//   const baseToday = useMemo(() => new Date(), []);

//   // Helper function to get current date in GA4 timezone
//   const getTodayInGA4Timezone = () => {
//     const now = new Date();
//     // Get the date string in GA4 timezone
//     const dateStr = now.toLocaleDateString('en-US', {
//       timeZone: GA4_TIMEZONE,
//       year: 'numeric',
//       month: '2-digit',
//       day: '2-digit'
//     });
//     // Parse back to YYYY-MM-DD format
//     const [month, day, year] = dateStr.split('/');
//     return `${year}-${month}-${day}`;
//   };

//   // Build timezone-aware date presets
//   const dateRanges: DateRange[] = useMemo(() => {
//     // Get today in GA4 timezone
//     const todayInGA4 = getTodayInGA4Timezone();
//     const todayDate = new Date(todayInGA4 + 'T00:00:00');

//     // Google Analytics uses "yesterday" as the end date for relative ranges
//     const yesterday = addDays(todayDate, -1);
//     const yesterdayStr = toISODateLocal(yesterday);

//     console.log('📅 Date Range Calculation (GA4 Timezone):', {
//       timezone: GA4_TIMEZONE,
//       todayInGA4,
//       yesterday: yesterdayStr
//     });

//     return [
//       { id: 'today', label: 'Today', startDate: todayInGA4, endDate: todayInGA4 },
//       { id: 'yesterday', label: 'Yesterday', startDate: yesterdayStr, endDate: yesterdayStr },
//       { id: 'last7days', label: 'Last 7 days', startDate: toISODateLocal(addDays(yesterday, -6)), endDate: yesterdayStr },
//       { id: 'last30days', label: 'Last 30 days', startDate: toISODateLocal(addDays(yesterday, -29)), endDate: yesterdayStr },
//       { id: 'thismonth', label: 'This month', startDate: toISODateLocal(startOfMonth(todayDate)), endDate: yesterdayStr },
//       {
//         id: 'lastmonth',
//         label: 'Last month',
//         startDate: toISODateLocal(startOfMonth(addDays(startOfMonth(todayDate), -1))),
//         endDate: toISODateLocal(endOfMonth(addDays(startOfMonth(todayDate), -1))),
//       },
//       { id: 'last3months', label: 'Last 3 months', startDate: toISODateLocal(addDays(yesterday, -89)), endDate: yesterdayStr },
//       { id: 'thisyear', label: 'This year', startDate: `${todayDate.getFullYear()}-01-01`, endDate: yesterdayStr },
//       { id: 'lastyear', label: 'Last year', startDate: `${todayDate.getFullYear() - 1}-01-01`, endDate: `${todayDate.getFullYear() - 1}-12-31` },
//       { id: 'custom', label: 'Custom…', startDate: '', endDate: '' },
//     ];
//   }, []); // Empty deps - recalculate on every render to get fresh GA4 timezone date

//   // Fetch GA4 properties
//   useEffect(() => {
//     const fetchProperties = async () => {
//       if (!user) return;

//       setIsLoadingProperties(true);
//       setPropertiesError(null);

//       try {
//         const response = await fetch('/api/ga4/properties', { credentials: 'include' });
//         if (!response.ok) {
//           const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
//           throw new Error(errorData.details || errorData.error || 'Failed to fetch GA4 properties');
//         }
//         const data = await response.json();
//         setProperties(data.properties || []);
//       } catch (error: any) {
//         const errorMessage = error.message || 'Failed to load GA4 properties';
//         setPropertiesError(errorMessage + '. Please make sure you granted Analytics permissions during sign-in.');
//         setProperties([]);
//       } finally {
//         setIsLoadingProperties(false);
//       }
//     };

//     fetchProperties();
//   }, [user]);

//   // Fetch GA4 analytics when inputs change
//   useEffect(() => {
//     const controller = new AbortController();

//     const fetchAnalyticsData = async () => {
//       if (!selectedProperty) {
//         setAnalyticsData(null);
//         return;
//       }

//       let startDate: string | undefined;
//       let endDate: string | undefined;

//       if (selectedDateRange === 'custom') {
//         if (!appliedCustom) {
//           setAnalyticsData(null);
//           return;
//         }
//         startDate = appliedCustom.startDate;
//         endDate = appliedCustom.endDate;
//       } else {
//         if (!selectedDateRange) {
//           setAnalyticsData(null);
//           return;
//         }
//         const preset = dateRanges.find(d => d.id === selectedDateRange);
//         if (!preset) {
//           setAnalyticsData(null);
//           return;
//         }
//         startDate = preset.startDate;
//         endDate = preset.endDate;
//       }

//       setIsLoadingAnalytics(true);
//       setAnalyticsError(null);

//       try {
//         // Calculate previous period dates for comparison
//         const start = new Date(startDate!);
//         const end = new Date(endDate!);
//         const periodDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
//         const prevEnd = new Date(start);
//         prevEnd.setDate(prevEnd.getDate() - 1);
//         const prevStart = new Date(prevEnd);
//         prevStart.setDate(prevStart.getDate() - periodDays);

//         const prevStartDate = toISODateLocal(prevStart);
//         const prevEndDate = toISODateLocal(prevEnd);

//         // Fetch current period data
//         const qs = new URLSearchParams({
//           propertyId: selectedProperty,
//           startDate: startDate!,
//           endDate: endDate!,
//         });

//         const response = await fetch(`/api/ga4/analytics?${qs.toString()}`, {
//           credentials: 'include',
//           signal: controller.signal,
//         });

//         if (!response.ok) {
//           const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
//           throw new Error(errorData.details || errorData.error || 'Failed to fetch analytics data');
//         }

//         const data = await response.json();
//         setAnalyticsData(data);

//         // Fetch previous period data for comparison
//         try {
//           const prevQs = new URLSearchParams({
//             propertyId: selectedProperty,
//             startDate: prevStartDate,
//             endDate: prevEndDate,
//           });

//           const prevResponse = await fetch(`/api/ga4/analytics?${prevQs.toString()}`, {
//             credentials: 'include',
//             signal: controller.signal,
//           });

//           if (prevResponse.ok) {
//             const prevData = await prevResponse.json();
//             setPreviousPeriodData(prevData);
//           } else {
//             setPreviousPeriodData(null);
//           }
//         } catch (prevError) {
//           // Silently fail for previous period - comparison just won't show
//           setPreviousPeriodData(null);
//         }

//         setPropertyAccessError(null);
//       } catch (error: any) {
//         if (controller.signal.aborted) return;

//         let errorMessage = 'Failed to load analytics data';
//         if (error?.message) errorMessage = error.message;
//         else if (error?.details) errorMessage = error.details;

//         if (
//           errorMessage.includes('denied access') ||
//           errorMessage.includes('Access denied') ||
//           errorMessage.includes('429') ||
//           errorMessage.includes('PERMISSION')
//         ) {
//           setPropertyAccessError({
//             propertyId: selectedProperty,
//             error:
//               'Access denied: This property does not have access to the GA4 Reporting API. Please enable it in Google Cloud Console.',
//           });
//           setAnalyticsError(null);
//         } else {
//           setPropertyAccessError(null);
//           setAnalyticsError(errorMessage);
//         }
//         setAnalyticsData(null);
//       } finally {
//         if (!controller.signal.aborted) setIsLoadingAnalytics(false);
//       }
//     };

//     fetchAnalyticsData();
//     return () => controller.abort();
//   }, [selectedProperty, selectedDateRange, appliedCustom, dateRanges]);

//   const handlePropertyChange = (property: GAProperty) => {
//     setSelectedProperty(property.id);
//     setIsPropertyDropdownOpen(false);
//     setPropertyAccessError(null);
//     setAnalyticsError(null);
//   };

//   const handleDateRangeChange = (dateRange: DateRange) => {
//     setSelectedDateRange(dateRange.id);
//     setAppliedCustom(null);
//     setIsDateDropdownOpen(false);
//   };

//   const handleLogout = async () => {
//     await logout();
//     navigate('/');
//   };

//   const getSelectedPropertyName = () => {
//     const property = properties.find(p => p.id === selectedProperty);
//     return property ? property.displayName : 'Choose a property...';
//   };

//   const getSelectedDateRangeName = () => {
//     if (selectedDateRange === 'custom' && appliedCustom) {
//       return `${appliedCustom.startDate} to ${appliedCustom.endDate}`;
//     }
//     const dateRange = dateRanges.find(d => d.id === selectedDateRange);
//     return dateRange ? dateRange.label : 'Select date range...';
//   };

//   if (isPending) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
//           <h3 className="text-xl font-semibold text-gray-800">Loading...</h3>
//         </div>
//       </div>
//     );
//   }

//   if (!user) return null;

//   const formatDuration = (seconds: number): string => {
//     const mins = Math.floor(seconds / 60);
//     const secs = Math.floor(seconds % 60);
//     return `${mins}m ${secs}s`;
//   };

//   const calculateComparison = (current: number, previous: number | null): { percentage: number; isPositive: boolean } | null => {
//     if (previous === null || previous === 0) return null;
//     const percentage = ((current - previous) / previous) * 100;
//     return {
//       percentage: Math.abs(percentage),
//       isPositive: percentage >= 0,
//     };
//   };

//   const handleChatSubmit = async (question: string) => {
//     if (!selectedProperty || !question.trim()) {
//       setChatError('Please select a property and enter a question');
//       return;
//     }

//     let startDate: string | undefined;
//     let endDate: string | undefined;

//     if (selectedDateRange === 'custom') {
//       if (!appliedCustom) {
//         setChatError('Please select a date range');
//         return;
//       }
//       startDate = appliedCustom.startDate;
//       endDate = appliedCustom.endDate;
//     } else {
//       const preset = dateRanges.find(d => d.id === selectedDateRange);
//       if (!preset) {
//         setChatError('Please select a date range');
//         return;
//       }
//       startDate = preset.startDate;
//       endDate = preset.endDate;
//     }

//     setIsLoadingChat(true);
//     setChatError(null);
//     setChatAnswer('');

//     try {
//       const response = await fetch('/api/chat', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         credentials: 'include',
//         body: JSON.stringify({
//           question,
//           propertyId: selectedProperty,
//           startDate,
//           endDate,
//         }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
//         throw new Error(errorData.details || errorData.error || 'Failed to get AI response');
//       }

//       const data = await response.json();
//       setChatAnswer(data.answer);
//     } catch (error: any) {
//       setChatError(error.message || 'Failed to get AI response');
//     } finally {
//       setIsLoadingChat(false);
//     }
//   };

//   const suggestedQuestions = [
//     'What are my top-performing pages?',
//     'How many users came from social media?',
//     'Which country has the highest engagement?',
//     'Compare this month to last month',
//     "What's my bounce rate trend?"
//   ];

//   return (
//     <div className="min-h-screen" style={{ backgroundColor: '#7C3AED' }}>
//       {/* Centered Content Container */}
//       <div className="mx-auto py-5" style={{ maxWidth: '80%', width: '100%' }}>
//         {/* Inner Container with Light Background */}
//         <div style={{ backgroundColor: '#F5F5F5', minHeight: '100vh', borderRadius: '12px', overflow: 'hidden' }} className="px-8 py-6">
//           {/* Header with Gradient */}
//           <div className="bg-gradient-to-r from-blue-400 via-cyan-300 to-yellow-400 px-8 py-8 mb-6 -mx-8" style={{ marginTop: '-24px', borderRadius: '12px 12px 0 0' }}>
//             <div className="flex items-center justify-between">
//               <div className="flex items-center space-x-4">
//                 {/* Rocket Icon */}
//                 <Rocket className="w-10 h-10 text-white" fill="white" strokeWidth={1.5} />
//                 <div>
//                   <h1 className="text-4xl font-bold text-white">GA4 Analytics Dashboard</h1>
//                   <p className="text-base text-white/95 mt-1">AI-Powered Google Analytics 4 Insights</p>
//                 </div>
//               </div>
//               <div className="flex items-center space-x-3">
//                 <button className="bg-gray-100 hover:bg-gray-200 text-gray-900 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
//                   Demo User
//                 </button>
//                 <button
//                   onClick={handleLogout}
//                   className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
//                 >
//                   Sign Out
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Main Content */}
//           <div className="w-full">
//             {/* Filter Controls */}
//             <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
//               {/* Property Selector */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-900 mb-2">
//                   Select GA4 Property:
//                 </label>
//                 <div className="relative">
//                 <button
//                   onClick={() => {
//                     setIsPropertyDropdownOpen(!isPropertyDropdownOpen);
//                     setIsDateDropdownOpen(false);
//                   }}
//                   className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-left flex items-center justify-between hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 >
//                   <span className={`${selectedProperty ? 'text-gray-900' : 'text-gray-500'}`}>
//                     {selectedProperty ? getSelectedPropertyName() : 'My Website - GA4'}
//                   </span>
//                   <ChevronDown className="w-4 h-4 text-gray-400" />
//                 </button>

//                 {isPropertyDropdownOpen && (
//                   <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
//                     {isLoadingProperties ? (
//                       <div className="px-4 py-2 text-center text-gray-500">
//                         <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600 mx-auto"></div>
//                         <p className="mt-1 text-xs">Loading...</p>
//                       </div>
//                     ) : propertiesError ? (
//                       <div className="px-4 py-2 text-center text-red-600 text-sm">
//                         <p>{propertiesError}</p>
//                       </div>
//                     ) : properties.length === 0 ? (
//                       <div className="px-4 py-2 text-center text-gray-500 text-sm">
//                         <p>No GA4 properties found</p>
//                       </div>
//                     ) : (
//                       properties.map((property) => (
//                         <button
//                           key={property.id}
//                           onClick={() => handlePropertyChange(property)}
//                           className="w-full px-4 py-2 text-left hover:bg-blue-50 transition-colors text-gray-800 text-sm"
//                         >
//                           {property.displayName}
//                         </button>
//                       ))
//                     )}
//                   </div>
//                 )}
//               </div>

//                 {/* Property Access Error */}
//                 {propertyAccessError && selectedProperty === propertyAccessError.propertyId && (
//                   <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
//                     <div className="flex items-start">
//                       <svg className="w-5 h-5 text-red-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
//                         <path
//                           fillRule="evenodd"
//                           d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
//                           clipRule="evenodd"
//                         />
//                       </svg>
//                       <p className="text-sm text-red-700">{propertyAccessError.error}</p>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Date Range Selector */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-900 mb-2">Date Range</label>
//               <div className="relative">
//                 <button
//                   onClick={() => {
//                     setIsDateDropdownOpen(!isDateDropdownOpen);
//                     setIsPropertyDropdownOpen(false);
//                   }}
//                   className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-left flex items-center justify-between hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 >
//                   <span className={`${selectedDateRange ? 'text-gray-900' : 'text-gray-500'}`}>
//                     {getSelectedDateRangeName()}
//                   </span>
//                   <ChevronDown className="w-4 h-4 text-gray-400" />
//                 </button>

//                 {isDateDropdownOpen && (
//                   <div
//                     className="
//       absolute z-20 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg
//       left-0                   /* anchor to left of trigger */
//       w-full md:w-auto         /* full width on small screens, auto on md+ */
//       max-w-[calc(100vw-2rem)] /* never exceed viewport minus 1rem gutters */
//       overflow-hidden          /* prevent horizontal overflow */
//     "
//                   >
//                     {/* Presets */}
//                     <div className="max-h-48 overflow-y-auto divide-y divide-gray-100">
//                       {dateRanges.map((dateRange) => (
//                         <button
//                           key={dateRange.id}
//                           onClick={() => {
//                             if (dateRange.id === 'custom') {
//                               setSelectedDateRange('custom');
//                               return;
//                             }
//                             setSelectedDateRange(dateRange.id);
//                             setAppliedCustom(null);
//                             setIsDateDropdownOpen(false);
//                           }}
//                           className={`w-full px-4 py-2 text-left text-sm transition-colors ${selectedDateRange === dateRange.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-blue-50 text-gray-800'
//                             }`}
//                         >
//                           {dateRange.label}
//                         </button>
//                       ))}
//                     </div>

//                     {/* Custom calendar */}
//                     {selectedDateRange === 'custom' && (
//                       <div
//                         className="
//           p-3 border-t border-gray-200
//           w-[calc(100vw-2rem)] md:w-[620px] /* responsive panel width */
//         "
//                       >
//                         <div className="flex items-center justify-between mb-2">
//                           <div className="text-sm text-gray-600">
//                             {customRange?.from && customRange?.to
//                               ? `${toISODateLocal(customRange.from)} to ${toISODateLocal(customRange.to)}`
//                               : 'Select a start and end date'}
//                           </div>
//                           {(customRange?.from || customRange?.to) && (
//                             <button
//                               onClick={() => setCustomRange(undefined)}
//                               className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
//                             >
//                               <X className="w-3 h-3" /> Clear
//                             </button>
//                           )}
//                         </div>

//                         {/* Make months side-by-side on md+, stack on small */}
//                         <div
//                           className="
//             [&_.rdp]:!m-0 [&_.rdp]:!p-0
//             [&_.rdp-months]:grid [&_.rdp-months]:grid-cols-1
//             md:[&_.rdp-months]:grid-cols-2 md:[&_.rdp-months]:gap-3
//           "
//                         >
//                           <DayPicker
//                             mode="range"
//                             numberOfMonths={2}
//                             selected={customRange}
//                             onSelect={setCustomRange}
//                             defaultMonth={baseToday}
//                             weekStartsOn={1}
//                             disabled={{ after: baseToday }} /* no future dates */
//                           />
//                         </div>

//                         <div className="mt-3 flex items-center justify-end gap-2">
//                           <button
//                             onClick={() => {
//                               setCustomRange(undefined);
//                               setSelectedDateRange('last7days');
//                               setAppliedCustom(null);
//                               setIsDateDropdownOpen(false);
//                             }}
//                             className="px-3 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
//                           >
//                             Cancel
//                           </button>
//                           <button
//                             onClick={() => {
//                               if (!customRange?.from || !customRange?.to) return;
//                               let startDate = toISODateLocal(customRange.from);
//                               let endDate = toISODateLocal(customRange.to);
//                               const todayInGA4 = getTodayInGA4Timezone();
//                               // Don't allow future dates (based on GA4 timezone)
//                               if (endDate > todayInGA4) endDate = todayInGA4;
//                               if (startDate > endDate) [startDate, endDate] = [endDate, startDate];
//                               console.log('📅 Custom date range applied:', { startDate, endDate, todayInGA4 });
//                               setAppliedCustom({ startDate, endDate });
//                               setSelectedDateRange('custom');
//                               setIsDateDropdownOpen(false);
//                             }}
//                             disabled={!customRange?.from || !customRange?.to}
//                             className="px-3 py-2 text-sm rounded-lg bg-blue-600 text-white disabled:opacity-50"
//                           >
//                             Apply
//                           </button>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 )}

//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Timestamp and Date Range Info */}
//           <div className="mb-6">
//             <div className="text-xs text-gray-500">
//               {analyticsData?.timestamp ? (
//                 <>Generated at {new Date(analyticsData.timestamp).toLocaleTimeString()} on {new Date(analyticsData.timestamp).toLocaleDateString()}</>
//               ) : analyticsError ? (
//                 <span className="text-red-600">{analyticsError}</span>
//               ) : (
//                 <>Select property and date range to view analytics</>
//               )}
//             </div>

//           </div>

//           {/* KPI Cards */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//             {/* Sessions */}
//             <div className="bg-white rounded-lg shadow-sm p-6 relative overflow-hidden" style={{ borderLeft: '4px solid #3B82F6' }}>
//               <div className="flex items-start">
//                 <div className="w-full">
//                   <div className="flex items-center mb-3">
//                     <Users className="w-5 h-5 text-gray-700 mr-2" />
//                     <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">SESSIONS</span>
//                   </div>
//                   {isLoadingAnalytics ? (
//                     <div className="flex items-center justify-center h-12">
//                       <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600"></div>
//                     </div>
//                   ) : analyticsData ? (
//                     <>
//                       <div className="text-3xl font-bold text-gray-900 mb-2">
//                         {analyticsData.metrics.sessions.toLocaleString()}
//                       </div>
//                       {(() => {
//                         const comparison = calculateComparison(
//                           analyticsData.metrics.sessions,
//                           previousPeriodData?.metrics.sessions ?? null
//                         );
//                         return comparison ? (
//                           <div className={`text-sm font-medium ${comparison.isPositive ? 'text-green-600' : 'text-red-600'}`}>
//                             {comparison.isPositive ? '+' : '-'}{comparison.percentage.toFixed(1)}% vs last month
//                           </div>
//                         ) : null;
//                       })()}
//                     </>
//                   ) : (
//                     <div className="text-sm text-gray-400 italic">Select property and date range</div>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Users */}
//             <div className="bg-white rounded-lg shadow-sm p-6 relative overflow-hidden" style={{ borderLeft: '4px solid #3B82F6' }}>
//               <div className="flex items-start">
//                 <div className="w-full">
//                   <div className="flex items-center mb-3">
//                     <User className="w-5 h-matics text-gray-700 mr-2" />
//                     <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">USERS</span>
//                   </div>
//                   {isLoadingAnalytics ? (
//                     <div className="flex items-center justify-center h-12">
//                       <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600"></div>
//                     </div>
//                   ) : analyticsData ? (
//                     <>
//                       <div className="text-3xl font-bold text-gray-900 mb-2">
//                         {analyticsData.metrics.users.toLocaleString()}
//                       </div>
//                       {(() => {
//                         const comparison = calculateComparison(
//                           analyticsData.metrics.users,
//                           previousPeriodData?.metrics.users ?? null
//                         );
//                         return comparison ? (
//                           <div className={`text-sm font-medium ${comparison.isPositive ? 'text-green-600' : 'text-red-600'}`}>
//                             {comparison.isPositive ? '+' : '-'}{comparison.percentage.toFixed(1)}% vs last month
//                           </div>
//                         ) : null;
//                       })()}
//                     </>
//                   ) : (
//                     <div className="text-sm text-gray-400 italic">Select property and date range</div>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Page Views */}
//             <div className="bg-white rounded-lg shadow-sm p-6 relative overflow-hidden" style={{ borderLeft: '4px solid #3B82F6' }}>
//               <div className="flex items-start">
//                 <div className="w-full">
//                   <div className="flex items-center mb-3">
//                     <Eye className="w-5 h-5 text-gray-700 mr-2" />
//                     <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">PAGE VIEWS</span>
//                   </div>
//                 {isLoadingAnalytics ? (
//                   <div className="flex items-center justify-center h-12">
//                     <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600"></div>
//                   </div>
//                 ) : analyticsData ? (
//                   <>
//                     <div className="text-3xl font-bold text-gray-900 mb-2">
//                       {analyticsData.metrics.pageViews.toLocaleString()}
//                     </div>
//                     {(() => {
//                       const comparison = calculateComparison(
//                         analyticsData.metrics.pageViews,
//                         previousPeriodData?.metrics.pageViews ?? null
//                       );
//                       return comparison ? (
//                         <div className={`text-sm font-medium ${comparison.isPositive ? 'text-green-600' : 'text-red-600'}`}>
//                           {comparison.isPositive ? '+' : '-'}{comparison.percentage.toFixed(1)}% vs last month
//                         </div>
//                       ) : null;
//                     })()}
//                   </>
//                 ) : (
//                   <div className="text-sm text-gray-400 italic">Select property and date range</div>
//                 )}
//                 </div>
//               </div>
//             </div>

//             {/* Bounce Rate */}
//             <div className="bg-white rounded-lg shadow-sm p-6 relative overflow-hidden" style={{ borderLeft: '4px solid #3B82F6' }}>
//               <div className="flex items-start">
//                 <div className="w-full">
//                   <div className="flex items-center mb-3">
//                     <Zap className="w-5 h-5 text-gray-700 mr-2" />
//                     <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">BOUNCE RATE</span>
//                   </div>
//                 {isLoadingAnalytics ? (
//                   <div className="flex items-center justify-center h-12">
//                     <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600"></div>
//                   </div>
//                 ) : analyticsData ? (
//                   <>
//                     <div className="text-3xl font-bold text-gray-900 mb-2">
//                       {(analyticsData.metrics.bounceRate * 100).toFixed(1)}%
//                     </div>
//                     {(() => {
//                       const comparison = calculateComparison(
//                         analyticsData.metrics.bounceRate,
//                         previousPeriodData?.metrics.bounceRate ?? null
//                       );
//                       // For bounce rate, lower is better, so invert the logic
//                       return comparison ? (
//                         <div className={`text-sm font-medium ${!comparison.isPositive ? 'text-green-600' : 'text-red-600'}`}>
//                           {comparison.isPositive ? '+' : '-'}{comparison.percentage.toFixed(1)}% vs last month
//                         </div>
//                       ) : null;
//                     })()}
//                   </>
//                 ) : (
//                   <div className="text-sm text-gray-400 italic">Select property and date range</div>
//                 )}
//                 </div>
//               </div>
//             </div>

//             {/* Avg Session Duration */}
//             <div className="bg-white rounded-lg shadow-sm p-6 relative overflow-hidden" style={{ borderLeft: '4px solid #3B82F6' }}>
//               <div className="flex items-start">
//                 <div className="w-full">
//                   <div className="flex items-center mb-3">
//                     <Clock className="w-5 h-5 text-gray-700 mr-2" />
//                     <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">AVG. SESSION DURATION</span>
//                   </div>
//                 {isLoadingAnalytics ? (
//                   <div className="flex items-center justify-center h-12">
//                     <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600"></div>
//                   </div>
//                 ) : analyticsData ? (
//                   <>
//                     <div className="text-3xl font-bold text-gray-900 mb-2">
//                       {formatDuration(analyticsData.metrics.avgSessionDuration)}
//                     </div>
//                     {(() => {
//                       const comparison = calculateComparison(
//                         analyticsData.metrics.avgSessionDuration,
//                         previousPeriodData?.metrics.avgSessionDuration ?? null
//                       );
//                       return comparison ? (
//                         <div className={`text-sm font-medium ${comparison.isPositive ? 'text-green-600' : 'text-red-600'}`}>
//                           {comparison.isPositive ? '+' : '-'}{comparison.percentage.toFixed(1)}% vs last month
//                         </div>
//                       ) : null;
//                     })()}
//                   </>
//                 ) : (
//                   <div className="text-sm text-gray-400 italic">Select property and date range</div>
//                 )}
//               </div>
//             </div>
//           </div>

//             {/* Conversions */}
//             <div className="bg-white rounded-lg shadow-sm p-6 relative overflow-hidden" style={{ borderLeft: '4px solid #3B82F6' }}>
//               <div className="flex items-start">
//                 <div className="w-full">
//                   <div className="flex items-center mb-3">
//                     <Flag className="w-5 h-5 text-gray-700 mr-2" />
//                     <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">CONVERSIONS</span>
//                   </div>
//                 {isLoadingAnalytics ? (
//                   <div className="flex items-center justify-center h-12">
//                     <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600"></div>
//                   </div>
//                 ) : analyticsData ? (
//                   <>
//                     <div className="text-3xl font-bold text-gray-900 mb-2">
//                       {analyticsData.metrics.conversions.toLocaleString()}
//                     </div>
//                     {(() => {
//                       const comparison = calculateComparison(
//                         analyticsData.metrics.conversions,
//                         previousPeriodData?.metrics.conversions ?? null
//                       );
//                       return comparison ? (
//                         <div className={`text-sm font-medium ${comparison.isPositive ? 'text-green-600' : 'text-red-600'}`}>
//                           {comparison.isPositive ? '+' : '-'}{comparison.percentage.toFixed(1)}% vs last month
//                         </div>
//                       ) : null;
//                     })()}
//                   </>
//                 ) : (
//                   <div className="text-sm text-gray-400 italic">Select property and date range</div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Sessions Over Time Chart */}
//         <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
//           <div className="flex items-center mb-6">
//             <TrendingUp className="w-5 h-5 text-gray-700 mr-2" />
//             <h3 className="text-lg font-semibold text-gray-900">Sessions Over Time</h3>
//           </div>
//           {isLoadingAnalytics ? (
//             <div className="h-96 flex items-center justify-center">
//               <div className="text-center">
//                 <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600 mx-auto mb-4"></div>
//                 <p className="text-gray-500">Loading chart data...</p>
//               </div>
//             </div>
//           ) : analyticsData && analyticsData.chartData && analyticsData.chartData.length > 0 ? (
//             <div className="h-96 w-full">
//               <ResponsiveContainer width="100%" height="100%">
//                 <AreaChart
//                   data={analyticsData.chartData}
//                   margin={{ top: 10, right: 30, left: 0, bottom: 80 }}
//                 >
//                   <defs>
//                     <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
//                       <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
//                       <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
//                     </linearGradient>
//                   </defs>
//                   <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
//                   <XAxis
//                     dataKey="date"
//                     stroke="#6B7280"
//                     style={{ fontSize: '12px' }}
//                     tickFormatter={(value) => {
//                       if (!value) return '';
//                       try {
//                         // Handle ISO date string (YYYY-MM-DD) - add time to avoid timezone issues
//                         let date: Date;
//                         if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
//                           // ISO format: add noon time to avoid timezone conversion issues
//                           date = new Date(value + 'T12:00:00');
//                         } else {
//                           date = new Date(value);
//                         }
//                         if (isNaN(date.getTime())) {
//                           return String(value);
//                         }
//                         return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
//                       } catch (e) {
//                         return String(value);
//                       }
//                     }}
//                     angle={-45}
//                     textAnchor="end"
//                     height={80}
//                   />
//                   <YAxis
//                     stroke="#6B7280"
//                     style={{ fontSize: '12px' }}
//                     domain={[0, 'auto']}
//                     tickFormatter={(value) => value.toLocaleString()}
//                   />
//                   <Tooltip
//                     contentStyle={{
//                       backgroundColor: 'white',
//                       border: '1px solid #E5E7EB',
//                       borderRadius: '6px',
//                       padding: '8px 12px'
//                     }}
//                     labelFormatter={(value) => {
//                       if (!value) return '';
//                       try {
//                         let date: Date;
//                         if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
//                           // ISO format: add noon time to avoid timezone conversion issues
//                           date = new Date(value + 'T12:00:00');
//                         } else {
//                           date = new Date(value);
//                         }
//                         if (isNaN(date.getTime())) {
//                           return String(value);
//                         }
//                         return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
//                       } catch (e) {
//                         return String(value);
//                       }
//                     }}
//                     formatter={(value: any) => [`${value.toLocaleString()} sessions`, 'Sessions']}
//                   />
//                   <Area
//                     type="monotone"
//                     dataKey="sessions"
//                     stroke="#3B82F6"
//                     strokeWidth={2}
//                     fill="url(#colorSessions)"
//                     dot={{ fill: '#3B82F6', r: 4 }}
//                     activeDot={{ r: 6 }}
//                   />
//                 </AreaChart>
//               </ResponsiveContainer>
//             </div>
//           ) : (
//             <div className="h-96 flex items-center justify-center">
//               <p className="text-gray-400 italic">Select property and date range to view chart</p>
//             </div>
//           )}
//         </div>

//           {/* Traffic Sources Chart */}
//           <TrafficSources
//             data={analyticsData?.trafficSources || []}
//             isLoading={isLoadingAnalytics}
//           />

//           {/* AI Chatbot */}
//           <div className="bg-gradient-to-b from-blue-400 via-purple-500 to-purple-700 rounded-lg shadow-sm p-10 mb-8 mt-8">
//             <div className="flex items-center justify-center mb-8">
//               <Bot className="w-10 h-10 text-white mr-3" />
//               <h3 className="text-3xl font-bold text-white text-center">Ask AI About Your Data</h3>
//             </div>

//             <div className="mb-8 flex items-center gap-3">
//               <input
//                 type="text"
//                 value={chatQuestion}
//                 onChange={(e) => setChatQuestion(e.target.value)}
//                 onKeyPress={(e) => {
//                   if (e.key === 'Enter' && !isLoadingChat) {
//                     handleChatSubmit(chatQuestion);
//                   }
//                 }}
//                 placeholder="Ask anything about your GA4 data..."
//                 className="flex-1 bg-white rounded-lg px-5 py-3.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white text-base"
//                 disabled={isLoadingChat || !selectedProperty}
//               />
//               <button
//                 onClick={() => handleChatSubmit(chatQuestion)}
//                 disabled={isLoadingChat || !selectedProperty || !chatQuestion.trim()}
//                 className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-8 py-3.5 rounded-lg font-semibold transition-colors flex items-center gap-2 text-base"
//               >
//                 {isLoadingChat ? (
//                   <>
//                     <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
//                     <span>Loading...</span>
//                   </>
//                 ) : (
//                   <>
//                     <Send className="w-5 h-5" />
//                     <span>Ask AI</span>
//                   </>
//                 )}
//               </button>
//             </div>

//             {!selectedProperty && (
//               <div className="mb-6 p-4 bg-white/20 rounded-lg text-center">
//                 <p className="text-white text-sm">Please select a GA4 property above to ask questions</p>
//               </div>
//             )}

//             <div className="mb-6">
//               <div className="mb-2 text-left">
//                 <span className="text-white text-sm opacity-90">Try asking:</span>
//               </div>
//               <div className="flex flex-wrap gap-2">
//                 {suggestedQuestions.map((question, index) => (
//                   <button
//                     key={index}
//                     onClick={() => {
//                       setChatQuestion(question);
//                     }}
//                     disabled={isLoadingChat || !selectedProperty}
//                     className="bg-purple-300/30 hover:bg-purple-300/50 disabled:bg-gray-400/30 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors"
//                   >
//                     {question}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {chatError && (
//               <div className="mb-6 p-4 bg-red-500/30 border border-red-400 rounded-lg">
//                 <p className="text-white text-sm">{chatError}</p>
//               </div>
//             )}

//             {chatAnswer && (
//               <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
//                 <p className="text-white whitespace-pre-wrap leading-relaxed">{chatAnswer}</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/react-app/hooks/useGoogleAuth";
import {
  Rocket,
  ChevronDown,
  Users,
  Eye,
  Clock,
  Flag,
  X,
  Zap,
  User,
  TrendingUp,
  Bot,
  Send,
} from "lucide-react";
import { useNavigate } from "react-router";
import { DayPicker, DateRange as DayPickerRange } from "react-day-picker";
import "react-day-picker/dist/style.css";
import TrafficSources from "@/react-app/components/TrafficSources";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

interface GAProperty {
  id: string;
  displayName: string;
}

interface DateRange {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
}

interface AnalyticsData {
  metrics: {
    sessions: number;
    users: number;
    pageViews: number;
    bounceRate: number;
    avgSessionDuration: number;
    conversions: number;
  };
  chartData: {
    date: string;
    sessions: number;
  }[];
  trafficSources?: {
    name: string;
    value: number;
  }[];
  timestamp: string;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}

type IsoDate = string; // "YYYY-MM-DD"

function toISODateLocal(d: Date): IsoDate {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

export default function Dashboard() {
  const { user, logout, isPending, fetchUser } = useAuth();
  const navigate = useNavigate();

  // Fetch user on mount
  useEffect(() => {
    fetchUser();
  }, []);

  // Redirect to home if not logged in
  useEffect(() => {
    if (!isPending && !user) navigate("/");
  }, [user, isPending, navigate]);

  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [selectedDateRange, setSelectedDateRange] =
    useState<string>("last7days"); // default like GA4
  const [isPropertyDropdownOpen, setIsPropertyDropdownOpen] = useState(false);
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [properties, setProperties] = useState<GAProperty[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);
  const [propertiesError, setPropertiesError] = useState<string | null>(null);

  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [previousPeriodData, setPreviousPeriodData] =
    useState<AnalyticsData | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [propertyAccessError, setPropertyAccessError] = useState<{
    propertyId: string;
    error: string;
  } | null>(null);

  const [customRange, setCustomRange] = useState<DayPickerRange | undefined>(
    undefined
  );
  const [appliedCustom, setAppliedCustom] = useState<{
    startDate: IsoDate;
    endDate: IsoDate;
  } | null>(null);

  // Chatbot state
  const [chatQuestion, setChatQuestion] = useState<string>("");
  const [chatAnswer, setChatAnswer] = useState<string>("");
  const [isLoadingChat, setIsLoadingChat] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string | null>(null);

  // TIMEZONE CONFIGURATION - Change this to match your GA4 property timezone
  const GA4_TIMEZONE = "America/Los_Angeles"; // Match GA4 API timezone from logs

  // Local today for UI components (calendar picker)
  const baseToday = useMemo(() => new Date(), []);

  // Helper function to get current date in GA4 timezone
  const getTodayInGA4Timezone = () => {
    const now = new Date();
    // Get the date string in GA4 timezone
    const dateStr = now.toLocaleDateString("en-US", {
      timeZone: GA4_TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    // Parse back to YYYY-MM-DD format
    const [month, day, year] = dateStr.split("/");
    return `${year}-${month}-${day}`;
  };

  // Build timezone-aware date presets
  const dateRanges: DateRange[] = useMemo(() => {
    // Get today in GA4 timezone
    const todayInGA4 = getTodayInGA4Timezone();
    const todayDate = new Date(todayInGA4 + "T00:00:00");

    // Google Analytics uses "yesterday" as the end date for relative ranges
    const yesterday = addDays(todayDate, -1);
    const yesterdayStr = toISODateLocal(yesterday);

    console.log("📅 Date Range Calculation (GA4 Timezone):", {
      timezone: GA4_TIMEZONE,
      todayInGA4,
      yesterday: yesterdayStr,
    });

    return [
      {
        id: "today",
        label: "Today",
        startDate: todayInGA4,
        endDate: todayInGA4,
      },
      {
        id: "yesterday",
        label: "Yesterday",
        startDate: yesterdayStr,
        endDate: yesterdayStr,
      },
      {
        id: "last7days",
        label: "Last 7 days",
        startDate: toISODateLocal(addDays(yesterday, -6)),
        endDate: yesterdayStr,
      },
      {
        id: "last30days",
        label: "Last 30 days",
        startDate: toISODateLocal(addDays(yesterday, -29)),
        endDate: yesterdayStr,
      },
      {
        id: "thismonth",
        label: "This month",
        startDate: toISODateLocal(startOfMonth(todayDate)),
        endDate: yesterdayStr,
      },
      {
        id: "lastmonth",
        label: "Last month",
        startDate: toISODateLocal(
          startOfMonth(addDays(startOfMonth(todayDate), -1))
        ),
        endDate: toISODateLocal(
          endOfMonth(addDays(startOfMonth(todayDate), -1))
        ),
      },
      {
        id: "last3months",
        label: "Last 3 months",
        startDate: toISODateLocal(addDays(yesterday, -89)),
        endDate: yesterdayStr,
      },
      {
        id: "thisyear",
        label: "This year",
        startDate: `${todayDate.getFullYear()}-01-01`,
        endDate: yesterdayStr,
      },
      {
        id: "lastyear",
        label: "Last year",
        startDate: `${todayDate.getFullYear() - 1}-01-01`,
        endDate: `${todayDate.getFullYear() - 1}-12-31`,
      },
      { id: "custom", label: "Custom…", startDate: "", endDate: "" },
    ];
  }, []); // Empty deps - recalculate on every render to get fresh GA4 timezone date

  // Fetch GA4 properties
  useEffect(() => {
    const fetchProperties = async () => {
      if (!user) return;

      setIsLoadingProperties(true);
      setPropertiesError(null);

      try {
        const response = await fetch("/api/ga4/properties", {
          credentials: "include",
        });
        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ error: "Unknown error" }));
          throw new Error(
            errorData.details ||
              errorData.error ||
              "Failed to fetch GA4 properties"
          );
        }
        const data = await response.json();
        setProperties(data.properties || []);
      } catch (error: any) {
        const errorMessage = error.message || "Failed to load GA4 properties";
        setPropertiesError(
          errorMessage +
            ". Please make sure you granted Analytics permissions during sign-in."
        );
        setProperties([]);
      } finally {
        setIsLoadingProperties(false);
      }
    };

    fetchProperties();
  }, [user]);

  // Fetch GA4 analytics when inputs change
  useEffect(() => {
    const controller = new AbortController();

    const fetchAnalyticsData = async () => {
      if (!selectedProperty) {
        setAnalyticsData(null);
        return;
      }

      let startDate: string | undefined;
      let endDate: string | undefined;

      if (selectedDateRange === "custom") {
        if (!appliedCustom) {
          setAnalyticsData(null);
          return;
        }
        startDate = appliedCustom.startDate;
        endDate = appliedCustom.endDate;
      } else {
        if (!selectedDateRange) {
          setAnalyticsData(null);
          return;
        }
        const preset = dateRanges.find((d) => d.id === selectedDateRange);
        if (!preset) {
          setAnalyticsData(null);
          return;
        }
        startDate = preset.startDate;
        endDate = preset.endDate;
      }

      setIsLoadingAnalytics(true);
      setAnalyticsError(null);

      try {
        // Calculate previous period dates for comparison
        const start = new Date(startDate!);
        const end = new Date(endDate!);
        const periodDays = Math.ceil(
          (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
        );
        const prevEnd = new Date(start);
        prevEnd.setDate(prevEnd.getDate() - 1);
        const prevStart = new Date(prevEnd);
        prevStart.setDate(prevStart.getDate() - periodDays);

        const prevStartDate = toISODateLocal(prevStart);
        const prevEndDate = toISODateLocal(prevEnd);

        // Fetch current period data
        const qs = new URLSearchParams({
          propertyId: selectedProperty,
          startDate: startDate!,
          endDate: endDate!,
        });

        const response = await fetch(`/api/ga4/analytics?${qs.toString()}`, {
          credentials: "include",
          signal: controller.signal,
        });

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ error: "Unknown error" }));
          throw new Error(
            errorData.details ||
              errorData.error ||
              "Failed to fetch analytics data"
          );
        }

        const data = await response.json();
        setAnalyticsData(data);

        // Fetch previous period data for comparison
        try {
          const prevQs = new URLSearchParams({
            propertyId: selectedProperty,
            startDate: prevStartDate,
            endDate: prevEndDate,
          });

          const prevResponse = await fetch(
            `/api/ga4/analytics?${prevQs.toString()}`,
            {
              credentials: "include",
              signal: controller.signal,
            }
          );

          if (prevResponse.ok) {
            const prevData = await prevResponse.json();
            setPreviousPeriodData(prevData);
          } else {
            setPreviousPeriodData(null);
          }
        } catch (prevError) {
          // Silently fail for previous period - comparison just won't show
          setPreviousPeriodData(null);
        }

        setPropertyAccessError(null);
      } catch (error: any) {
        if (controller.signal.aborted) return;

        let errorMessage = "Failed to load analytics data";
        if (error?.message) errorMessage = error.message;
        else if (error?.details) errorMessage = error.details;

        if (
          errorMessage.includes("denied access") ||
          errorMessage.includes("Access denied") ||
          errorMessage.includes("429") ||
          errorMessage.includes("PERMISSION")
        ) {
          setPropertyAccessError({
            propertyId: selectedProperty,
            error:
              "Access denied: This property does not have access to the GA4 Reporting API. Please enable it in Google Cloud Console.",
          });
          setAnalyticsError(null);
        } else {
          setPropertyAccessError(null);
          setAnalyticsError(errorMessage);
        }
        setAnalyticsData(null);
      } finally {
        if (!controller.signal.aborted) setIsLoadingAnalytics(false);
      }
    };

    fetchAnalyticsData();
    return () => controller.abort();
  }, [selectedProperty, selectedDateRange, appliedCustom, dateRanges]);

  const handlePropertyChange = (property: GAProperty) => {
    setSelectedProperty(property.id);
    setIsPropertyDropdownOpen(false);
    setPropertyAccessError(null);
    setAnalyticsError(null);
  };

  const handleDateRangeChange = (dateRange: DateRange) => {
    setSelectedDateRange(dateRange.id);
    setAppliedCustom(null);
    setIsDateDropdownOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const getSelectedPropertyName = () => {
    const property = properties.find((p) => p.id === selectedProperty);
    return property ? property.displayName : "Choose a property...";
  };

  const getSelectedDateRangeName = () => {
    if (selectedDateRange === "custom" && appliedCustom) {
      return `${appliedCustom.startDate} to ${appliedCustom.endDate}`;
    }
    const dateRange = dateRanges.find((d) => d.id === selectedDateRange);
    return dateRange ? dateRange.label : "Select date range...";
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold text-gray-800">Loading...</h3>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  const calculateComparison = (
    current: number,
    previous: number | null
  ): { percentage: number; isPositive: boolean } | null => {
    if (previous === null || previous === 0) return null;
    const percentage = ((current - previous) / previous) * 100;
    return {
      percentage: Math.abs(percentage),
      isPositive: percentage >= 0,
    };
  };

  // Safe ISO "YYYY-MM-DD" -> local Date (avoid Date parsing differences)
  function parseISODateToLocal(dateStr: string): Date {
    const parts = dateStr.split("-");
    if (parts.length !== 3) return new Date(dateStr); // fallback
    const [y, m, d] = parts.map((p) => parseInt(p, 10));
    return new Date(y, m - 1, d);
  }

  const getComparisonLabelForRange = (
    selectedDateRangeId: string | null,
    appliedCustomRange: { startDate: string; endDate: string } | null
  ) => {
    if (!selectedDateRangeId) return "previous period";

    const presetMap: Record<string, string> = {
      today: "yesterday",
      yesterday: "day before",
      last7days: "last week",
      last30days: "last 30 days",
      thismonth: "last month",
      lastmonth: "last month",
      last3months: "last 3 months",
      thisyear: "last year",
      lastyear: "last year",
    };

    if (presetMap[selectedDateRangeId]) return presetMap[selectedDateRangeId];

    if (selectedDateRangeId === "custom" && appliedCustomRange) {
      const start = parseISODateToLocal(appliedCustomRange.startDate);
      const end = parseISODateToLocal(appliedCustomRange.endDate);
      const days =
        Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) +
        1;
      return days === 1 ? "previous day" : `previous ${days} days`;
    }

    return "previous period";
  };

  // Renders a comparison badge. invert = true means "lower is better" (e.g. bounce rate)
  function renderKpiComparison(
    current: number,
    previous: number | null,
    invert = false
  ) {
    const comparison = calculateComparison(current, previous ?? null);
    if (!comparison) return null;

    // If invert=true, a positive numeric change is bad (so color red), negative is good (green).
    const isBetter = invert ? !comparison.isPositive : comparison.isPositive;
    const sign = comparison.isPositive ? "+" : "-";

    return (
      <div
        className={`text-sm font-medium ${
          isBetter ? "text-green-600" : "text-red-600"
        }`}
      >
        {sign}
        {comparison.percentage.toFixed(1)}% vs{" "}
        {getComparisonLabelForRange(selectedDateRange, appliedCustom)}
      </div>
    );
  }

  const handleChatSubmit = async (question: string) => {
    if (!selectedProperty || !question.trim()) {
      setChatError("Please select a property and enter a question");
      return;
    }

    let startDate: string | undefined;
    let endDate: string | undefined;

    if (selectedDateRange === "custom") {
      if (!appliedCustom) {
        setChatError("Please select a date range");
        return;
      }
      startDate = appliedCustom.startDate;
      endDate = appliedCustom.endDate;
    } else {
      const preset = dateRanges.find((d) => d.id === selectedDateRange);
      if (!preset) {
        setChatError("Please select a date range");
        return;
      }
      startDate = preset.startDate;
      endDate = preset.endDate;
    }

    setIsLoadingChat(true);
    setChatError(null);
    setChatAnswer("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          question,
          propertyId: selectedProperty,
          startDate,
          endDate,
          dateRangeLabel: getSelectedDateRangeName(), // Send the selected date range name
        }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        throw new Error(
          errorData.details || errorData.error || "Failed to get AI response"
        );
      }

      const data = await response.json();
      setChatAnswer(data.answer);
    } catch (error: any) {
      setChatError(error.message || "Failed to get AI response");
    } finally {
      setIsLoadingChat(false);
    }
  };

  const suggestedQuestions = [
    "What are my top-performing pages?",
    "How many users came from social media?",
    "Which country has the highest engagement?",
    "Compare this month to last month",
    "What's my bounce rate trend?",
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#7C3AED" }}>
      {/* Centered Content Container */}
      <div className="mx-auto py-5" style={{ maxWidth: "80%", width: "100%" }}>
        {/* Inner Container with Light Background */}
        <div
          style={{
            backgroundColor: "#F5F5F5",
            minHeight: "100vh",
            borderRadius: "12px",
            overflow: "hidden",
          }}
          className="px-8 py-6"
        >
          {/* Header with Gradient */}
          <div
            className="bg-gradient-to-r from-blue-400 via-cyan-300 to-yellow-400 px-8 py-8 mb-6 -mx-8"
            style={{ marginTop: "-24px", borderRadius: "12px 12px 0 0" }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Rocket Icon */}
                <Rocket
                  className="w-10 h-10 text-white"
                  fill="white"
                  strokeWidth={1.5}
                />
                <div>
                  <h1 className="text-4xl font-bold text-white">
                    GA4 Analytics Dashboard
                  </h1>
                  <p className="text-base text-white/95 mt-1">
                    AI-Powered Google Analytics 4 Insights
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-3 text-sm text-white/90">
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border-2 border-white/30"
                  />
                  <span>Welcome, {user.name}</span>
                  {user.hasGA4Access && (
                    <span className="bg-white/20 text-white px-2 py-1 rounded-full text-xs font-medium">
                      GA4 Access ✓
                    </span>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="w-full">
            {/* Filter Controls */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Property Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Select GA4 Property:
                </label>
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsPropertyDropdownOpen(!isPropertyDropdownOpen);
                      setIsDateDropdownOpen(false);
                    }}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-left flex items-center justify-between hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <span
                      className={`${
                        selectedProperty ? "text-gray-900" : "text-gray-500"
                      }`}
                    >
                      {selectedProperty
                        ? getSelectedPropertyName()
                        : "My Website - GA4"}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>

                  {isPropertyDropdownOpen && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {isLoadingProperties ? (
                        <div className="px-4 py-2 text-center text-gray-500">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600 mx-auto"></div>
                          <p className="mt-1 text-xs">Loading...</p>
                        </div>
                      ) : propertiesError ? (
                        <div className="px-4 py-2 text-center text-red-600 text-sm">
                          <p>{propertiesError}</p>
                        </div>
                      ) : properties.length === 0 ? (
                        <div className="px-4 py-2 text-center text-gray-500 text-sm">
                          <p>No GA4 properties found</p>
                        </div>
                      ) : (
                        properties.map((property) => (
                          <button
                            key={property.id}
                            onClick={() => handlePropertyChange(property)}
                            className="w-full px-4 py-2 text-left hover:bg-blue-50 transition-colors text-gray-800 text-sm"
                          >
                            {property.displayName}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Property Access Error */}
                {propertyAccessError &&
                  selectedProperty === propertyAccessError.propertyId && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start">
                        <svg
                          className="w-5 h-5 text-red-600 mr-2 mt-0.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <p className="text-sm text-red-700">
                          {propertyAccessError.error}
                        </p>
                      </div>
                    </div>
                  )}
              </div>

              {/* Date Range Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Date Range
                </label>
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsDateDropdownOpen(!isDateDropdownOpen);
                      setIsPropertyDropdownOpen(false);
                    }}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-left flex items-center justify-between hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <span
                      className={`${
                        selectedDateRange ? "text-gray-900" : "text-gray-500"
                      }`}
                    >
                      {getSelectedDateRangeName()}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>

                  {isDateDropdownOpen && (
                    <div
                      className="
      absolute z-20 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg
      left-0                   /* anchor to left of trigger */
      w-full md:w-auto         /* full width on small screens, auto on md+ */
      max-w-[calc(100vw-2rem)] /* never exceed viewport minus 1rem gutters */
      overflow-hidden          /* prevent horizontal overflow */
    "
                    >
                      {/* Presets */}
                      <div className="max-h-48 overflow-y-auto divide-y divide-gray-100">
                        {dateRanges.map((dateRange) => (
                          <button
                            key={dateRange.id}
                            onClick={() => {
                              if (dateRange.id === "custom") {
                                setSelectedDateRange("custom");
                                return;
                              }
                              setSelectedDateRange(dateRange.id);
                              setAppliedCustom(null);
                              setIsDateDropdownOpen(false);
                            }}
                            className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                              selectedDateRange === dateRange.id
                                ? "bg-blue-50 text-blue-700"
                                : "hover:bg-blue-50 text-gray-800"
                            }`}
                          >
                            {dateRange.label}
                          </button>
                        ))}
                      </div>

                      {/* Custom calendar */}
                      {selectedDateRange === "custom" && (
                        <div
                          className="
          p-3 border-t border-gray-200
          w-[calc(100vw-2rem)] md:w-[620px] /* responsive panel width */
        "
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm text-gray-600">
                              {customRange?.from && customRange?.to
                                ? `${toISODateLocal(
                                    customRange.from
                                  )} to ${toISODateLocal(customRange.to)}`
                                : "Select a start and end date"}
                            </div>
                            {(customRange?.from || customRange?.to) && (
                              <button
                                onClick={() => setCustomRange(undefined)}
                                className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                              >
                                <X className="w-3 h-3" /> Clear
                              </button>
                            )}
                          </div>

                          {/* Make months side-by-side on md+, stack on small */}
                          <div
                            className="
            [&_.rdp]:!m-0 [&_.rdp]:!p-0
            [&_.rdp-months]:grid [&_.rdp-months]:grid-cols-1
            md:[&_.rdp-months]:grid-cols-2 md:[&_.rdp-months]:gap-3
          "
                          >
                            <DayPicker
                              mode="range"
                              numberOfMonths={2}
                              selected={customRange}
                              onSelect={setCustomRange}
                              defaultMonth={baseToday}
                              weekStartsOn={1}
                              disabled={{
                                after: baseToday,
                              }} /* no future dates */
                            />
                          </div>

                          <div className="mt-3 flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setCustomRange(undefined);
                                setSelectedDateRange("last7days");
                                setAppliedCustom(null);
                                setIsDateDropdownOpen(false);
                              }}
                              className="px-3 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => {
                                if (!customRange?.from || !customRange?.to)
                                  return;
                                let startDate = toISODateLocal(
                                  customRange.from
                                );
                                let endDate = toISODateLocal(customRange.to);
                                const todayInGA4 = getTodayInGA4Timezone();
                                // Don't allow future dates (based on GA4 timezone)
                                if (endDate > todayInGA4) endDate = todayInGA4;
                                if (startDate > endDate)
                                  [startDate, endDate] = [endDate, startDate];
                                console.log("📅 Custom date range applied:", {
                                  startDate,
                                  endDate,
                                  todayInGA4,
                                });
                                setAppliedCustom({ startDate, endDate });
                                setSelectedDateRange("custom");
                                setIsDateDropdownOpen(false);
                              }}
                              disabled={!customRange?.from || !customRange?.to}
                              className="px-3 py-2 text-sm rounded-lg bg-blue-600 text-white disabled:opacity-50"
                            >
                              Apply
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Timestamp and Date Range Info */}
          <div className="mb-6">
            <div className="text-xs text-gray-500">
              {analyticsData?.timestamp ? (
                <>
                  Generated at{" "}
                  {new Date(analyticsData.timestamp).toLocaleTimeString()} on{" "}
                  {new Date(analyticsData.timestamp).toLocaleDateString()}
                </>
              ) : analyticsError ? (
                <span className="text-red-600">{analyticsError}</span>
              ) : (
                <>Select property and date range to view analytics</>
              )}
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Sessions */}
            <div
              className="bg-white rounded-lg shadow-sm p-6 relative overflow-hidden"
              style={{ borderLeft: "4px solid #3B82F6" }}
            >
              <div className="flex items-start">
                <div className="w-full">
                  <div className="flex items-center mb-3">
                    <Users className="w-5 h-5 text-gray-700 mr-2" />
                    <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      SESSIONS
                    </span>
                  </div>

                  {isLoadingAnalytics ? (
                    <div className="flex items-center justify-center h-12">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600"></div>
                    </div>
                  ) : analyticsData ? (
                    <>
                      <div className="text-3xl font-bold text-gray-900 mb-2">
                        {analyticsData.metrics.sessions.toLocaleString()}
                      </div>
                      {renderKpiComparison(
                        analyticsData.metrics.sessions,
                        previousPeriodData?.metrics.sessions ?? null,
                        false
                      )}
                    </>
                  ) : (
                    <div className="text-sm text-gray-400 italic">
                      Select property and date range
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Users */}
            <div
              className="bg-white rounded-lg shadow-sm p-6 relative overflow-hidden"
              style={{ borderLeft: "4px solid #3B82F6" }}
            >
              <div className="flex items-start">
                <div className="w-full">
                  <div className="flex items-center mb-3">
                    {/* fixed typo: h-matics -> h-5 */}
                    <User className="w-5 h-5 text-gray-700 mr-2" />
                    <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      USERS
                    </span>
                  </div>

                  {isLoadingAnalytics ? (
                    <div className="flex items-center justify-center h-12">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600"></div>
                    </div>
                  ) : analyticsData ? (
                    <>
                      <div className="text-3xl font-bold text-gray-900 mb-2">
                        {analyticsData.metrics.users.toLocaleString()}
                      </div>
                      {renderKpiComparison(
                        analyticsData.metrics.users,
                        previousPeriodData?.metrics.users ?? null,
                        false
                      )}
                    </>
                  ) : (
                    <div className="text-sm text-gray-400 italic">
                      Select property and date range
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Page Views */}
            <div
              className="bg-white rounded-lg shadow-sm p-6 relative overflow-hidden"
              style={{ borderLeft: "4px solid #3B82F6" }}
            >
              <div className="flex items-start">
                <div className="w-full">
                  <div className="flex items-center mb-3">
                    <Eye className="w-5 h-5 text-gray-700 mr-2" />
                    <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      PAGE VIEWS
                    </span>
                  </div>

                  {isLoadingAnalytics ? (
                    <div className="flex items-center justify-center h-12">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600"></div>
                    </div>
                  ) : analyticsData ? (
                    <>
                      <div className="text-3xl font-bold text-gray-900 mb-2">
                        {analyticsData.metrics.pageViews.toLocaleString()}
                      </div>
                      {renderKpiComparison(
                        analyticsData.metrics.pageViews,
                        previousPeriodData?.metrics.pageViews ?? null,
                        false
                      )}
                    </>
                  ) : (
                    <div className="text-sm text-gray-400 italic">
                      Select property and date range
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bounce Rate (lower is better) */}
            <div
              className="bg-white rounded-lg shadow-sm p-6 relative overflow-hidden"
              style={{ borderLeft: "4px solid #3B82F6" }}
            >
              <div className="flex items-start">
                <div className="w-full">
                  <div className="flex items-center mb-3">
                    <Zap className="w-5 h-5 text-gray-700 mr-2" />
                    <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      BOUNCE RATE
                    </span>
                  </div>

                  {isLoadingAnalytics ? (
                    <div className="flex items-center justify-center h-12">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600"></div>
                    </div>
                  ) : analyticsData ? (
                    <>
                      <div className="text-3xl font-bold text-gray-900 mb-2">
                        {(analyticsData.metrics.bounceRate * 100).toFixed(1)}%
                      </div>
                      {renderKpiComparison(
                        analyticsData.metrics.bounceRate,
                        previousPeriodData?.metrics.bounceRate ?? null,
                        true // invert: lower is better
                      )}
                    </>
                  ) : (
                    <div className="text-sm text-gray-400 italic">
                      Select property and date range
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Avg. Session Duration */}
            <div
              className="bg-white rounded-lg shadow-sm p-6 relative overflow-hidden"
              style={{ borderLeft: "4px solid #3B82F6" }}
            >
              <div className="flex items-start">
                <div className="w-full">
                  <div className="flex items-center mb-3">
                    <Clock className="w-5 h-5 text-gray-700 mr-2" />
                    <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      AVG. SESSION DURATION
                    </span>
                  </div>

                  {isLoadingAnalytics ? (
                    <div className="flex items-center justify-center h-12">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600"></div>
                    </div>
                  ) : analyticsData ? (
                    <>
                      <div className="text-3xl font-bold text-gray-900 mb-2">
                        {formatDuration(
                          analyticsData.metrics.avgSessionDuration
                        )}
                      </div>
                      {renderKpiComparison(
                        analyticsData.metrics.avgSessionDuration,
                        previousPeriodData?.metrics.avgSessionDuration ?? null,
                        false
                      )}
                    </>
                  ) : (
                    <div className="text-sm text-gray-400 italic">
                      Select property and date range
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Conversions */}
            <div
              className="bg-white rounded-lg shadow-sm p-6 relative overflow-hidden"
              style={{ borderLeft: "4px solid #3B82F6" }}
            >
              <div className="flex items-start">
                <div className="w-full">
                  <div className="flex items-center mb-3">
                    <Flag className="w-5 h-5 text-gray-700 mr-2" />
                    <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      CONVERSIONS
                    </span>
                  </div>

                  {isLoadingAnalytics ? (
                    <div className="flex items-center justify-center h-12">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600"></div>
                    </div>
                  ) : analyticsData ? (
                    <>
                      <div className="text-3xl font-bold text-gray-900 mb-2">
                        {analyticsData.metrics.conversions.toLocaleString()}
                      </div>
                      {renderKpiComparison(
                        analyticsData.metrics.conversions,
                        previousPeriodData?.metrics.conversions ?? null,
                        false
                      )}
                    </>
                  ) : (
                    <div className="text-sm text-gray-400 italic">
                      Select property and date range
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sessions Over Time Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center mb-6">
              <TrendingUp className="w-5 h-5 text-gray-700 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">
                Sessions Over Time
              </h3>
            </div>
            {isLoadingAnalytics ? (
              <div className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading chart data...</p>
                </div>
              </div>
            ) : analyticsData &&
              analyticsData.chartData &&
              analyticsData.chartData.length > 0 ? (
              <div className="h-96 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={analyticsData.chartData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 80 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorSessions"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#3B82F6"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3B82F6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      dataKey="date"
                      stroke="#6B7280"
                      style={{ fontSize: "12px" }}
                      tickFormatter={(value) => {
                        if (!value) return "";
                        try {
                          // Handle ISO date string (YYYY-MM-DD) - add time to avoid timezone issues
                          let date: Date;
                          if (
                            typeof value === "string" &&
                            value.match(/^\d{4}-\d{2}-\d{2}$/)
                          ) {
                            // ISO format: add noon time to avoid timezone conversion issues
                            date = new Date(value + "T12:00:00");
                          } else {
                            date = new Date(value);
                          }
                          if (isNaN(date.getTime())) {
                            return String(value);
                          }
                          return `${date.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}`;
                        } catch (e) {
                          return String(value);
                        }
                      }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      stroke="#6B7280"
                      style={{ fontSize: "12px" }}
                      domain={[0, "auto"]}
                      tickFormatter={(value) => value.toLocaleString()}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #E5E7EB",
                        borderRadius: "6px",
                        padding: "8px 12px",
                      }}
                      labelFormatter={(value) => {
                        if (!value) return "";
                        try {
                          let date: Date;
                          if (
                            typeof value === "string" &&
                            value.match(/^\d{4}-\d{2}-\d{2}$/)
                          ) {
                            // ISO format: add noon time to avoid timezone conversion issues
                            date = new Date(value + "T12:00:00");
                          } else {
                            date = new Date(value);
                          }
                          if (isNaN(date.getTime())) {
                            return String(value);
                          }
                          return date.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          });
                        } catch (e) {
                          return String(value);
                        }
                      }}
                      formatter={(value: any) => [
                        `${value.toLocaleString()} sessions`,
                        "Sessions",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="sessions"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      fill="url(#colorSessions)"
                      dot={{ fill: "#3B82F6", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-96 flex items-center justify-center">
                <p className="text-gray-400 italic">
                  Select property and date range to view chart
                </p>
              </div>
            )}
          </div>

          {/* Traffic Sources Chart */}
          <TrafficSources
            data={analyticsData?.trafficSources || []}
            isLoading={isLoadingAnalytics}
          />

          {/* AI Chatbot */}
          <div className="bg-gradient-to-b from-blue-400 via-purple-500 to-purple-700 rounded-lg shadow-sm p-10 mb-8 mt-8">
            <div className="flex items-center justify-center mb-8">
              <Bot className="w-10 h-10 text-white mr-3" />
              <h3 className="text-3xl font-bold text-white text-center">
                Ask AI About Your Data
              </h3>
            </div>

            <div className="mb-8 flex items-center gap-3">
              <input
                type="text"
                value={chatQuestion}
                onChange={(e) => setChatQuestion(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !isLoadingChat) {
                    handleChatSubmit(chatQuestion);
                  }
                }}
                placeholder="Ask anything about your GA4 data..."
                className="flex-1 bg-white rounded-lg px-5 py-3.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white text-base"
                disabled={isLoadingChat || !selectedProperty}
              />
              <button
                onClick={() => handleChatSubmit(chatQuestion)}
                disabled={
                  isLoadingChat || !selectedProperty || !chatQuestion.trim()
                }
                className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-8 py-3.5 rounded-lg font-semibold transition-colors flex items-center gap-2 text-base"
              >
                {isLoadingChat ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Ask AI</span>
                  </>
                )}
              </button>
            </div>

            {!selectedProperty && (
              <div className="mb-6 p-4 bg-white/20 rounded-lg text-center">
                <p className="text-white text-sm">
                  Please select a GA4 property above to ask questions
                </p>
              </div>
            )}

            <div className="mb-6">
              <div className="mb-2 text-left">
                <span className="text-white text-sm opacity-90">
                  Try asking:
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setChatQuestion(question);
                    }}
                    disabled={isLoadingChat || !selectedProperty}
                    className="bg-purple-300/30 hover:bg-purple-300/50 disabled:bg-gray-400/30 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            {chatError && (
              <div className="mb-6 p-4 bg-red-500/30 border border-red-400 rounded-lg">
                <p className="text-white text-sm">{chatError}</p>
              </div>
            )}

            {chatAnswer && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <p className="text-white whitespace-pre-wrap leading-relaxed">
                  {chatAnswer}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
