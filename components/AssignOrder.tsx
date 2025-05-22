'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import Button from '@/components/common/button';
import Modal from './common/Modal';
import Select from './common/select';
import { toast } from 'react-hot-toast';
import api from '@/store/api';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentUser } from '@/store/authSlice';
import Loader from './common/Loader';
import { useRouter } from 'next/navigation';
import { fetchRecipes, selectAllRecipes } from '@/store/recipeSlice';
import { fetchSubRecipes, selectAllSubRecipes } from '@/store/subRecipeSlice';
import { AppDispatch } from '@/store/store';
import { formatPositionName } from '@/utils/formatters';
import ConfirmationModal from './common/ConfirmationModal';
import { useTranslation } from '@/context/TranslationContext';

interface AdminOrder {
  orderId: number;
  orderType: 'RECIPE' | 'PREPARATION';
  orderStatus: 'PENDING' | 'FINISHED' | 'CANCELLED';
  assignedTo: string;
  assignedToId: number;
  assignedToPosition: string | null;
  assignedBy: string;
  assignedById: number;
  assignedByPosition: string;
  assignedTime: string;
  startTime: string;
  finishTime: string;
  branchId: number;
  branchName: string;
}

interface ChefOrder {
  orderId: number;
  orderType: 'RECIPE' | 'SUB_RECIPE';
  orderStatus: 'PENDING' | 'IN_PROGRESS' | 'FINISHED' | 'CANCELLED';
  assignedTime: string;
  recipeId: number;
  subRecipeId: number | null;
  recipeName: string;
  branchId: number;
  branchName: string;
}

interface AssignOrderProps {
  onClose: () => void;
}

const USER_OPTIONS = [
  { label: "Junaid", value: "Junaid" },
  { label: "Ali", value: "Ali" },
  { label: "Sarah", value: "Sarah" },
];

const ORDER_TYPE_OPTIONS = [
  { label: "RECIPE", value: "RECIPE" },
  { label: "PREPARATION", value: "PREPARATION" },
];

export default function AssignOrder({ onClose }: AssignOrderProps) {
  const { t } = useTranslation();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRoleLoading, setIsRoleLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState('');
  const [orderType, setOrderType] = useState<string>('');
  const [userError, setUserError] = useState('');
  const [orderTypeError, setOrderTypeError] = useState('');
  const [orders, setOrders] = useState<AdminOrder[] | ChefOrder[]>([]);
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });
  const currentUser = useSelector(selectCurrentUser);
  const isAdmin = currentUser?.role === 'Admin';
  const isChef = currentUser?.role === 'CHEF' || currentUser?.role === 'HEAD_CHEF';
  const router = useRouter();
  const recipes = useSelector(selectAllRecipes);
  const subRecipes = useSelector(selectAllSubRecipes);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (currentUser) {
      setIsRoleLoading(false);
      fetchOrders();
    }
  }, [currentUser]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const endpoint = isAdmin ? '/orders/all' : '/orders/my';
      const response = await api.get(endpoint);
      if (isAdmin && response.data?.allAssignedOrders) {
        setOrders(response.data.allAssignedOrders);
      } else if (!isAdmin && response.data?.assignedOrders) {
        setOrders(response.data.assignedOrders);
      }
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast.error(error.response?.data?.description || t('assignOrder.fetchOrdersError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateToPreparation = async (order: ChefOrder) => {
    try {
      if (order.orderType === 'RECIPE') {
        const result = await dispatch(fetchRecipes({
          page: 0,
          size: 1000,
          sortBy: "createdAt",
          direction: "asc"
        })).unwrap();
        
        const recipe = result.recipeList.find((r: any) => r.id === order.recipeId);
        if (recipe) {
          const unit = recipe.ingredientsItems?.[0]?.unit || '';
          router.push(`/recipes/${order.recipeId}?mode=preparation&orderId=${order.orderId}&unit=${unit}`);
        } else {
          toast.error(t('assignOrder.recipeNotFound'));
        }
      } else if (order.orderType === 'SUB_RECIPE') {
        const result = await dispatch(fetchSubRecipes({
          page: 0,
          size: 1000,
          sortBy: "createdAt",
          direction: "asc"
        })).unwrap();
        
        const subRecipe = result.subRecipeList.find((sr: any) => sr.id === order.subRecipeId);
        if (subRecipe) {
          const unit = subRecipe.ingredients?.[0]?.unit || '';
          router.push(`/recipes/sub-recipes/${order.subRecipeId}?mode=preparation&orderId=${order.orderId}&unit=${unit}`);
        } else {
          toast.error(t('assignOrder.subRecipeNotFound'));
        }
      }
    } catch (error: any) {
      console.error('Error navigating to preparation:', error);
      toast.error(t('assignOrder.preparationDetailsError'));
    }
  };

  const handleStartOrder = async (orderId: number) => {
    try {
      await api.post('/orders/start', { orderId });
      toast.success(t('assignOrder.orderStarted'));
      
      const order = orders.find(o => o.orderId === orderId) as ChefOrder;
      if (order) {
        await handleNavigateToPreparation(order);
      }
      
      fetchOrders();
    } catch (error: any) {
      console.error('Error starting order:', error);
      const errorMessage = (error.response?.data?.description || t('assignOrder.startOrderError'));
      setErrorModal({ 
        isOpen: true, 
        message: errorMessage.replace(/@(Solid Item|Liquid Item)/, '') 
      });
    }
  };

  const handleAddOrder = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      const response = await api.post('/orders/add', {
        assignedTo: selectedUser,
        orderType
      });
      await fetchOrders();
      setIsCreateModalOpen(false);
      resetForm();
      toast.success(t('assignOrder.orderAssigned'));
    } catch (error: any) {
      console.error('Error assigning order:', error);
      toast.error(error.response?.data?.description || t('assignOrder.assignOrderError'));
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    let isValid = true;
    
    if (!selectedUser) {
      setUserError(t('assignOrder.userRequired'));
      isValid = false;
    } else {
      setUserError('');
    }
    
    if (!orderType) {
      setOrderTypeError(t('assignOrder.orderTypeRequired'));
      isValid = false;
    } else {
      setOrderTypeError('');
    }
    
    return isValid;
  };

  const resetForm = () => {
    setSelectedUser('');
    setOrderType('');
    setUserError('');
    setOrderTypeError('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'FINISHED':
        return 'text-green-600';
      case 'CANCELLED':
        return 'text-red-600';
      case 'IN_PROGRESS':
        return 'text-blue-600';
      default:
        return 'text-orange-500';
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return t('assignOrder.status.inProgress');
      case 'PENDING':
        return t('assignOrder.status.pending');
      case 'FINISHED':
        return t('assignOrder.status.finished');
      case 'CANCELLED':
        return t('assignOrder.status.cancelled');
      default:
        return status;
    }
  };

  const calculateDuration = (startTime: string, finishTime: string) => {
    if (startTime === 'Not started' || finishTime === 'Not finished') {
      return t('assignOrder.notStarted');
    }

    const start = new Date(startTime);
    const finish = new Date(finishTime);
    const diffInSeconds = Math.floor((finish.getTime() - start.getTime()) / 1000);

    const hours = Math.floor(diffInSeconds / 3600);
    const minutes = Math.floor((diffInSeconds % 3600) / 60);
    const seconds = diffInSeconds % 60;

    if (hours > 0) {
      return t('assignOrder.duration.hoursMinutesSeconds', { hours: String(hours), minutes: String(minutes), seconds: String(seconds) });
    } else if (minutes > 0) {
      return t('assignOrder.duration.minutesSeconds', { minutes: String(minutes), seconds: String(seconds) });
    } else {
      return t('assignOrder.duration.seconds', { seconds: String(seconds) });
    }
  };

  if (isRoleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="medium" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#f1fff7] min-h-screen px-3 py-3 sm:px-4 md:px-8 sm:py-4 md:py-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold">{t('assignOrder.title')}</h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-[#05A49D] rounded-lg text-white px-3 py-1.5 text-xs sm:text-sm">
            {t('assignOrder.totalOrders', { count: String(orders.length) })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 flex-1">
        <div className={`grid ${isAdmin ? 'grid-cols-7' : isChef ? 'grid-cols-6' : 'grid-cols-4'} border-b pb-3 sm:pb-4 mb-3 sm:mb-4`}>
          {isAdmin && (
            <>
              <h2 className="text-gray-500 text-xs sm:text-sm">{t('assignOrder.assignedTo')}</h2>
              <h2 className="text-gray-500 text-xs sm:text-sm">{t('assignOrder.assignedBy')}</h2>
              <h2 className="text-gray-500 text-xs sm:text-sm">{t('assignOrder.branch')}</h2>
            </>
          )}
          {isChef && (
            <>
              <h2 className="text-gray-500 text-xs sm:text-sm">{t('assignOrder.orderId')}</h2>
              <h2 className="text-gray-500 text-xs sm:text-sm">{t('assignOrder.recipeName')}</h2>
            </>
          )}
          <h2 className="text-gray-500 text-xs sm:text-sm">{t('assignOrder.type')}</h2>
          {isAdmin && <h2 className="text-gray-500 text-xs sm:text-sm">{t('assignOrder.finishTime')}</h2>}
          <h2 className="text-gray-500 text-xs sm:text-sm">{t('assignOrder.status.title')}</h2>
          {isChef && <h2 className="text-gray-500 text-xs sm:text-sm">{t('assignOrder.actions')}</h2>}
        </div>

        {isLoading && orders.length === 0 ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-gray-500">{t('assignOrder.loadingOrders')}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-gray-500">{t('assignOrder.noOrdersFound', { isAdmin: String(isAdmin) })}</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {orders.map((order) => (
              <div 
                key={order.orderId} 
                className={`grid ${isAdmin ? 'grid-cols-7' : isChef ? 'grid-cols-6' : 'grid-cols-4'} items-center py-3 sm:py-4 border-b`}
              >
                {isChef && (
                  <>
                    <span className="text-gray-800 text-sm sm:text-base">{order.orderId}</span>
                    <span className="text-gray-800 text-sm sm:text-base">{(order as ChefOrder).recipeName}</span>
                  </>
                )}
                {isAdmin && (
                  <>
                    <span className="text-gray-800 text-sm sm:text-base">
                      {(order as AdminOrder).assignedTo}
                    </span>
                    <span className="text-gray-800 text-sm sm:text-base">
                      {(order as AdminOrder).assignedBy}
                    </span>
                    <span className="text-gray-800 text-sm sm:text-base">
                      {(order as AdminOrder).branchName}
                    </span>
                  </>
                )}
                <span className="text-gray-800 text-sm sm:text-base">{order.orderType}</span>
                {isAdmin && (
                  <span className="text-gray-800 text-sm sm:text-base">
                    {calculateDuration((order as AdminOrder).startTime, (order as AdminOrder).finishTime)}
                  </span>
                )}
                <span className={`text-sm sm:text-base font-medium ${getStatusColor(order.orderStatus)}`}>
                  {formatStatus(order.orderStatus)}
                </span>
                {isChef && (
                  <div>
                    {order.orderStatus === 'PENDING' && (
                      <Button
                        onClick={() => handleStartOrder(order.orderId)}
                        className="bg-[#339A89] text-white text-xs sm:text-sm px-3 py-1.5"
                        disabled={isLoading}
                      >
                        {t('assignOrder.start')}
                      </Button>
                    )}
                    {order.orderStatus === 'IN_PROGRESS' && (
                      <Button
                        onClick={() => handleNavigateToPreparation(order as ChefOrder)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm px-3 py-1.5"
                        disabled={isLoading}
                      >
                        {t('assignOrder.finish')}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal 
        isOpen={isCreateModalOpen}
        onClose={() => !isLoading && setIsCreateModalOpen(false)}
        title={t('assignOrder.assignNewOrder')}
        size="sm"
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          handleAddOrder();
        }} className="w-full">
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-medium">{t('assignOrder.assignTo')}</label>
            <Select
              value={selectedUser}
              onChange={(e) => {
                setSelectedUser(e.target.value);
                if (e.target.value) setUserError('');
              }}
              options={USER_OPTIONS}
              className={`w-full bg-white ${userError ? 'border-red-500' : ''}`}
              disabled={isLoading}
            />
            {userError && <p className="mt-1 text-red-500 text-sm">{userError}</p>}
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-medium">{t('assignOrder.orderType')}</label>
            <Select
              value={orderType}
              onChange={(e) => {
                setOrderType(e.target.value);
                if (e.target.value) setOrderTypeError('');
              }}
              options={ORDER_TYPE_OPTIONS}
              className={`w-full bg-white ${orderTypeError ? 'border-red-500' : ''}`}
              disabled={isLoading}
            />
            {orderTypeError && <p className="mt-1 text-red-500 text-sm">{orderTypeError}</p>}
          </div>
          
          <div className="flex justify-between gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (!isLoading) {
                  setIsCreateModalOpen(false);
                  resetForm();
                }
              }}
              className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 px-4 sm:px-6"
              disabled={isLoading}
            >
              {t('common.cancel')}
            </Button>
            
            <Button
              type="submit"
              className="bg-[#339A89] text-white hover:bg-[#2b8274] px-4 sm:px-6"
              disabled={isLoading}
            >
              {isLoading ? t('assignOrder.assigning') : t('assignOrder.assign')}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmationModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ isOpen: false, message: '' })}
        title={t('common.error')}
        message={errorModal.message}
        isAlert={true}
        okText={t('common.ok')}
      />
    </div>
  );
}