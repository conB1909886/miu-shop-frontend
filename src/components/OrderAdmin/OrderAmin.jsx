import { Button, Form, Space } from 'antd';
import React from 'react';
import { WrapperHeader, WrapperUploadFile } from './style';
import TableComponent from '../TableComponent/TableComponent';
import InputComponent from '../InputComponent/InputComponent';
import DrawerComponent from '../DrawerComponent/DrawerComponent';
import Loading from '../LoadingComponent/Loading';
import ModalComponent from '../ModalComponent/ModalComponent';
import { convertPrice, getBase64 } from '../../utils';
import { useEffect } from 'react';
import * as message from '../Message/Message';

import * as OrderService from '../../services/OrderService';
import { useQuery } from '@tanstack/react-query';
import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { orderContant } from '../../contant';
import PieChartComponent from './PieChart';
import { useMutationHooks } from '../../hooks/useMutationHook';

const OrderAdmin = () => {
  const user = useSelector((state) => state?.user);
  const [isModalOpenDelete, setIsModalOpenDelete] = React.useState(false);
  const [isOpenDrawer, setIsOpenDrawer] = React.useState(false);
  const [isLoadingUpdate, setIsLoadingUpdate] = React.useState(false);
  const [rowSelected, setRowSelected] = React.useState('');
  const inittial = () => ({
    isDelivered: false,
    isPaid: false,
    isConfirmed: false,
  });
  const [stateOrderDetails, setStateOrderDetails] = React.useState(inittial());

  const getAllOrder = async () => {
    const res = await OrderService.getAllOrder(user?.access_token);
    return res;
  };

  const queryOrder = useQuery({ queryKey: ['orders'], queryFn: getAllOrder });
  const mutationUpdate = useMutationHooks((data) => {
    const { id, token, ...rests } = data;
    const res = OrderService.updateOrder(id, token, { ...rests });
    return res;
  });

  const { isLoading: isLoadingOrders, data: orders } = queryOrder;
  const {
    data: dataUpdated,
    isLoading: isLoadingUpdated,
    isSuccess: isSuccessUpdated,
    isError: isErrorUpdated,
  } = mutationUpdate;
  const [form] = Form.useForm();

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <InputComponent
          // ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          // onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: 'block',
          }}
        />
        <Space>
          <Button
            type="primary"
            // onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Search
          </Button>
          <Button
            // onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? '#1890ff' : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        // setTimeout(() => searchInput.current?.select(), 100);
      }
    },
  });

  const handleDetailsOrder = () => {
    setIsOpenDrawer(true);
  };

  const renderAction = () => {
    return (
      <div>
        <EditOutlined
          style={{ color: 'orange', fontSize: '30px', cursor: 'pointer' }}
          onClick={handleDetailsOrder}
        />
      </div>
    );
  };

  const columns = [
    {
      title: 'User name',
      dataIndex: 'userName',
      sorter: (a, b) => a.userName.length - b.userName.length,
      ...getColumnSearchProps('userName'),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      sorter: (a, b) => a.phone.length - b.phone.length,
      ...getColumnSearchProps('phone'),
    },
    {
      title: 'Address',
      dataIndex: 'address',
      sorter: (a, b) => a.address.length - b.address.length,
      ...getColumnSearchProps('address'),
    },
    {
      title: 'Duyệt đơn hàng',
      dataIndex: 'isConfirmed',
      sorter: (a, b) => String(a.isConfirmed) - String(b.isConfirmed),
      ...getColumnSearchProps('isConfirmed'),
    },
    {
      title: 'Thanh toán',
      dataIndex: 'isPaid',
      sorter: (a, b) => a.isPaid.length - b.isPaid.length,
      ...getColumnSearchProps('isPaid'),
    },
    {
      title: 'Vận chuyển',
      dataIndex: 'isDelivered',
      sorter: (a, b) => a.isDelivered.length - b.isDelivered.length,
      ...getColumnSearchProps('isDelivered'),
    },
    {
      title: 'Payment method',
      dataIndex: 'paymentMethod',
      sorter: (a, b) => a.paymentMethod.length - b.paymentMethod.length,
      ...getColumnSearchProps('paymentMethod'),
    },
    {
      title: 'Total price',
      dataIndex: 'totalPrice',
      sorter: (a, b) => a.totalPrice.length - b.totalPrice.length,
      ...getColumnSearchProps('totalPrice'),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      render: renderAction,
    },
  ];
  const handleCancelDelete = () => {
    setIsModalOpenDelete(false);
  };

  const onUpdateOrder = () => {
    mutationUpdate.mutate(
      { id: rowSelected, token: user?.access_token, ...stateOrderDetails },
      {
        onSettled: () => {
          setIsLoadingUpdate(true);
          queryOrder.refetch().then(() => {
            setIsLoadingUpdate(false);
          });
        },
      }
    );
  };

  const handleOnchangeDetails = (e) => {
    setStateOrderDetails({
      ...stateOrderDetails,
      [e.target.name]: e.target.checked,
    });
  };

  const handlePayChanged = (e) => {
    setStateOrderDetails({
      ...stateOrderDetails,
      [e.target.name]: e.target.checked,
    });
  };

  const fetchGetDetailsOrder = async (rowSelected) => {
    const res = await OrderService.getDetailsOrder(rowSelected);
    if (res?.data) {
      setStateOrderDetails({
        isDelivered: res?.data?.isDelivered,
        isPaid: res?.data?.isPaid,
        isConfirmed: res?.data?.isConfirmed,
      });
    }
    setIsLoadingUpdate(false);
  };

  useEffect(() => {
    form.setFieldsValue(inittial());
  }, [form, stateOrderDetails]);

  useEffect(() => {
    if (rowSelected && isOpenDrawer) {
      setIsLoadingUpdate(true);
      fetchGetDetailsOrder(rowSelected);
    }
  }, [rowSelected, isOpenDrawer]);

  const dataTable =
    orders?.data?.length &&
    orders?.data?.map((order) => {
      // console.log('usewr', order);
      return {
        ...order,
        key: order._id,
        userName: order?.shippingAddress?.fullName,
        phone: order?.shippingAddress?.phone,
        address: order?.shippingAddress?.address,
        paymentMethod: orderContant.payment[order?.paymentMethod],
        isPaid: order?.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán',
        isDelivered: order?.isDelivered ? 'Thành công' : 'Chờ xử lý',
        isConfirmed: order?.isConfirmed ? 'Đã duyệt' : 'Chưa duyệt',
        totalPrice: convertPrice(order?.totalPrice),
      };
    });

  return (
    <div className="admin-order-page">
      <WrapperHeader>Quản lý đơn hàng</WrapperHeader>
      {/* <div style={{ height: 200, width: 200 }}>
        <PieChartComponent data={orders?.data} />
      </div> */}
      <div style={{ marginTop: '20px' }}>
        <TableComponent
          onRow={(record, rowIndex) => {
            return {
              onClick: (event) => {
                setRowSelected(record._id);
              },
            };
          }}
          columns={columns}
          isLoading={isLoadingOrders}
          data={dataTable}
        />
      </div>
      <DrawerComponent
        title="Trạng thái đơn hàng"
        isOpen={isOpenDrawer}
        onClose={() => setIsOpenDrawer(false)}
        width="90%"
      >
        <Loading isLoading={isLoadingUpdate || isLoadingUpdated}>
          <Form
            name="basic"
            labelCol={{ span: 3 }}
            wrapperCol={{ span: 22 }}
            onFinish={onUpdateOrder}
            autoComplete="on"
            form={form}
          >
            <Form.Item label="Duyệt đơn hàng" name="isConfirmed">
              <InputComponent
                type="checkbox"
                checked={stateOrderDetails['isConfirmed']}
                onChange={handleOnchangeDetails}
                name="isConfirmed"
              />
            </Form.Item>
            <Form.Item label="Đã thanh toán" name="isPaid">
              <InputComponent
                type="checkbox"
                checked={stateOrderDetails['isPaid']}
                onChange={handlePayChanged}
                name="isPaid"
              />
            </Form.Item>
            <Form.Item label="Vận chuyển" name="isDelivered">
              <InputComponent
                type="checkbox"
                checked={stateOrderDetails['isDelivered']}
                onChange={handleOnchangeDetails}
                name="isDelivered"
              />
            </Form.Item>
            <Form.Item wrapperCol={{ offset: 20, span: 16 }}>
              <Button type="primary" htmlType="submit">
                Apply
              </Button>
            </Form.Item>
          </Form>
        </Loading>
      </DrawerComponent>
    </div>
  );
};

export default OrderAdmin;
