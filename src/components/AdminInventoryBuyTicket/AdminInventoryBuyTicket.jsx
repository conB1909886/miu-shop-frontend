import { Button, Form, Space, Select, DatePicker } from 'antd';
import { PlusOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import React, { useRef } from 'react';
import { WrapperHeader } from './style';
import TableComponent from '../TableComponent/TableComponent';
import { useState } from 'react';
import InputComponent from '../InputComponent/InputComponent';
import * as InventoryBuyTicketService from '../../services/InventoryBuyTicketService';
import * as InventoryService from '../../services/InventoryService';
import * as ProductService from '../../services/ProductService';
import { useMutationHooks } from '../../hooks/useMutationHook';
import { renderInventoryOptions } from '../../utils';
import Loading from '../LoadingComponent/Loading';
import { useEffect } from 'react';
import * as message from '../Message/Message';
import { useQuery } from '@tanstack/react-query';
import DrawerComponent from '../DrawerComponent/DrawerComponent';
import { useSelector } from 'react-redux';
import ModalComponent from '../ModalComponent/ModalComponent';

const AdminInventoryBuyTicket = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rowSelected, setRowSelected] = useState('');
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);
  const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
  const user = useSelector((state) => state?.user);
  const searchInput = useRef(null);
  const inittial = () => ({
    ticketId: '',
    date: '',
    inventory: '',
    product: '',
    note: '',
  });
  const [stateInventoryBuyTicket, setStateInventoryBuyTicket] = useState(inittial());
  const [stateInventoryBuyTicketDetails, setStateInventoryBuyTicketDetails] = useState(inittial());

  const [form] = Form.useForm();

  const mutation = useMutationHooks((data) => {
    const { ticketId, date, inventory, note, selectedProduct, amount, price } = data;
    const p = allProducts?.data?.data?.find((i) => i._id === selectedProduct);
    const res = InventoryBuyTicketService.createInventoryBuyTicket({
      ticketId,
      date,
      inventory,
      products: [
        {
          name: p.name,
          amount: amount,
          price: price,
          product: p._id,
        },
      ],
      note,
    });
    return res;
  });
  const mutationUpdate = useMutationHooks((data) => {
    const { id, token, ...rests } = data;
    const res = InventoryBuyTicketService.updateInventoryBuyTicket(id, token, { ...rests });
    return res;
  });

  const mutationDeleted = useMutationHooks((data) => {
    const { id, token } = data;
    const res = InventoryBuyTicketService.deleteInventoryBuyTicket(id, token);
    return res;
  });

  const mutationDeletedMany = useMutationHooks((data) => {
    const { token, ...ids } = data;
    const res = InventoryBuyTicketService.deleteManyInventoryBuyTicket(ids, token);
    return res;
  });

  const getAllInventoryBuyTickets = async () => {
    const res = await InventoryBuyTicketService.getAllInventoryBuyTicket();
    return res;
  };

  const fetchGetDetailsInventoryBuyTicket = async (rowSelected) => {
    const res = await InventoryBuyTicketService.getDetailsInventoryBuyTicket(rowSelected);
    if (res?.data) {
      setStateInventoryBuyTicketDetails({
        ticketId: res?.data?.ticketId,
        date: res?.data?.date,
        inventory: res?.data?.inventory,
        products: res?.data?.products,
        note: res?.data?.note,
      });
    }
    setIsLoadingUpdate(false);
  };

  useEffect(() => {
    if (!isModalOpen) {
      form.setFieldsValue(stateInventoryBuyTicketDetails);
    } else {
      form.setFieldsValue(inittial());
    }
  }, [form, stateInventoryBuyTicketDetails, isModalOpen]);

  useEffect(() => {
    if (rowSelected && isOpenDrawer) {
      setIsLoadingUpdate(true);
      fetchGetDetailsInventoryBuyTicket(rowSelected);
    }
  }, [rowSelected, isOpenDrawer]);

  const handleDetailsInventoryBuyTicket = () => {
    setIsOpenDrawer(true);
  };

  const handleDelteManyInventoryBuyTickets = (ids) => {
    mutationDeletedMany.mutate(
      { ids: ids, token: user?.access_token },
      {
        onSettled: () => {
          queryInventoryBuyTicket.refetch();
        },
      },
    );
  };

  const { data, isLoading, isSuccess, isError } = mutation;
  const {
    data: dataUpdated,
    isLoading: isLoadingUpdated,
    isSuccess: isSuccessUpdated,
    isError: isErrorUpdated,
  } = mutationUpdate;
  const {
    data: dataDeleted,
    isLoading: isLoadingDeleted,
    isSuccess: isSuccessDelected,
    isError: isErrorDeleted,
  } = mutationDeleted;
  const {
    data: dataDeletedMany,
    isLoading: isLoadingDeletedMany,
    isSuccess: isSuccessDelectedMany,
    isError: isErrorDeletedMany,
  } = mutationDeletedMany;

  const fetchAllInventory = async () => {
    const res = await InventoryService.getAllInventory();
    return res;
  };

  const fetchAllProducts = async () => {
    const res = await ProductService.getAllProduct();
    return res;
  };

  const queryInventoryBuyTicket = useQuery({
    queryKey: ['inventories-buy-ticket'],
    queryFn: getAllInventoryBuyTickets,
  });

  const allInventory = useQuery({
    queryKey: ['inventory-list-buy-ticket'],
    queryFn: fetchAllInventory,
  });

  const allProducts = useQuery({
    queryKey: ['product-list-buy-ticket'],
    queryFn: fetchAllProducts,
  });

  const { isLoading: isLoadingInventoryBuyTickets, data: inventories } = queryInventoryBuyTicket;
  const renderAction = () => {
    if (user.role === 'viewer') {
      return null;
    }
    return (
      <div>
        <DeleteOutlined
          style={{ color: 'red', fontSize: '30px', cursor: 'pointer' }}
          onClick={() => setIsModalOpenDelete(true)}
        />
      </div>
    );
  };

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
  };
  const handleReset = (clearFilters) => {
    clearFilters();
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <InputComponent
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: 'block',
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
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
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
  });

  const columns = [
    {
      title: 'Ticket ID',
      dataIndex: 'ticketId',
      sorter: (a, b) => a.ticketId - b.ticketId,
      ...getColumnSearchProps('ticketId'),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      ...getColumnSearchProps('date'),
    },
    {
      title: 'Inventory',
      dataIndex: 'inventory',
      sorter: (a, b) => a.inventory.length - b.inventory.length,
      ...getColumnSearchProps('inventory'),
    },
    {
      title: 'Products',
      dataIndex: 'initialProduct',
      sorter: (a, b) => a.initialProduct.length - b.initialProduct.length,
      ...getColumnSearchProps('initialProduct'),
    },
    {
      title: 'Note',
      dataIndex: 'note',
      sorter: (a, b) => a.note.length - b.note.length,
      ...getColumnSearchProps('note'),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      render: renderAction,
    },
  ];
  const dataTable =
    inventories?.data?.length &&
    inventories?.data?.map((inventory) => {
      return {
        ...inventory,
        key: inventory._id,
        date: new Date(inventory.date).toLocaleDateString(),
        inventory: allInventory?.data?.data?.find((i) => i._id === inventory.inventory)?.name,
        initialProduct: inventory.products?.[0].name,
      };
    });

  useEffect(() => {
    if (isSuccess && data?.status === 'OK') {
      message.success();
      handleCancel();
    } else if (isError) {
      message.error();
    }
  }, [isSuccess]);

  useEffect(() => {
    if (isSuccessDelectedMany && dataDeletedMany?.status === 'OK') {
      message.success();
    } else if (isErrorDeletedMany) {
      message.error();
    }
  }, [isSuccessDelectedMany]);

  useEffect(() => {
    if (isSuccessDelected && dataDeleted?.status === 'OK') {
      message.success();
      handleCancelDelete();
    } else if (isErrorDeleted) {
      message.error();
    }
  }, [isSuccessDelected]);

  const handleCloseDrawer = () => {
    setIsOpenDrawer(false);
    setStateInventoryBuyTicketDetails({
      ticketId: '',
      date: '',
      inventory: '',
      products: [],
      note: '',
    });
    form.resetFields();
  };

  useEffect(() => {
    if (isSuccessUpdated && dataUpdated?.status === 'OK') {
      message.success();
      handleCloseDrawer();
    } else if (isErrorUpdated) {
      message.error();
    }
  }, [isSuccessUpdated]);

  const handleCancelDelete = () => {
    setIsModalOpenDelete(false);
  };

  const handleDeleteInventoryBuyTicket = () => {
    mutationDeleted.mutate(
      { id: rowSelected, token: user?.access_token },
      {
        onSettled: () => {
          queryInventoryBuyTicket.refetch();
        },
      },
    );
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setStateInventoryBuyTicket({
      ticketId: '',
      date: '',
      inventory: '',
      products: [],
      note: '',
    });
    form.resetFields();
  };

  const onFinish = () => {
    console.log(stateInventoryBuyTicket);
    const params = {
      ticketId: stateInventoryBuyTicket.ticketId,
      date: stateInventoryBuyTicket.date,
      inventory: stateInventoryBuyTicket.inventory,
      selectedProduct: stateInventoryBuyTicket.selectedProduct,
      price: stateInventoryBuyTicket.price,
      amount: stateInventoryBuyTicket.amount,
      note: stateInventoryBuyTicket.note,
    };
    mutation.mutate(params, {
      onSettled: () => {
        queryInventoryBuyTicket.refetch();
      },
    });
  };

  const handleOnchange = (e) => {
    setStateInventoryBuyTicket({
      ...stateInventoryBuyTicket,
      [e.target.name]: e.target.value,
    });
  };

  const handleChangeSelectInventory = (value) => {
    setStateInventoryBuyTicket({
      ...stateInventoryBuyTicket,
      inventory: value,
    });
  };

  const handleChangeSelectProduct = (value) => {
    console.log(value);
    setStateInventoryBuyTicket({
      ...stateInventoryBuyTicket,
      selectedProduct: value,
    });
  };

  const handleChangeDate = (date, dateString) => {
    console.log(+date, dateString);
    setStateInventoryBuyTicket({
      ...stateInventoryBuyTicket,
      date: +date,
    });
  };

  const handleOnchangeDetails = (e) => {
    setStateInventoryBuyTicketDetails({
      ...stateInventoryBuyTicketDetails,
      [e.target.name]: e.target.value,
    });
  };

  const onUpdateInventoryBuyTicket = () => {
    mutationUpdate.mutate(
      { id: rowSelected, token: user?.access_token, ...stateInventoryBuyTicketDetails },
      {
        onSettled: () => {
          queryInventoryBuyTicket.refetch();
        },
      },
    );
  };

  return (
    <div>
      <WrapperHeader>Quản lý phiếu nhập kho</WrapperHeader>
      <div style={{ marginTop: '10px' }}>
        <Button
          style={{
            height: '150px',
            width: '150px',
            borderRadius: '6px',
            borderStyle: 'dashed',
          }}
          onClick={() => setIsModalOpen(true)}
        >
          <PlusOutlined style={{ fontSize: '60px' }} />
        </Button>
      </div>
      <div style={{ marginTop: '20px' }}>
        <TableComponent
          handleDelteMany={handleDelteManyInventoryBuyTickets}
          columns={columns}
          isLoading={isLoadingInventoryBuyTickets}
          data={dataTable}
          onRow={(record, rowIndex) => {
            return {
              onClick: (event) => {
                setRowSelected(record._id);
              },
            };
          }}
        />
      </div>
      <ModalComponent
        forceRender
        title="Tạo phiếu nhập kho"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
      >
        <Loading isLoading={isLoading}>
          <Form
            name="basic"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            onFinish={onFinish}
            autoComplete="on"
            form={form}
          >
            <Form.Item
              label="Ticket Id"
              name="ticketId"
              rules={[{ required: true, message: 'Please input field!' }]}
            >
              <InputComponent
                value={stateInventoryBuyTicket.ticketId}
                onChange={handleOnchange}
                name="ticketId"
              />
            </Form.Item>
            <Form.Item
              label="Date"
              name="date"
              rules={[{ required: true, message: 'Please input field!' }]}
            >
              <DatePicker
                value={stateInventoryBuyTicket.date}
                onChange={handleChangeDate}
                name="date"
              />
            </Form.Item>
            <Form.Item
              label="Inventory"
              name="inventory"
              rules={[{ required: true, message: 'Please input field!' }]}
            >
              <Select
                name="inventory"
                value={stateInventoryBuyTicket.inventory}
                onChange={handleChangeSelectInventory}
                options={renderInventoryOptions(allInventory?.data?.data)}
              />
            </Form.Item>
            <Form.Item
              label="Products"
              name="product"
              rules={[{ required: true, message: 'Please input field!' }]}
            >
              <Select
                name="products"
                value={stateInventoryBuyTicket.products}
                onChange={handleChangeSelectProduct}
                options={renderInventoryOptions(allProducts?.data?.data)}
              />
            </Form.Item>
            <Form.Item
              label="Amount"
              name="amount"
              rules={[{ required: true, message: 'Please input field!' }]}
            >
              <InputComponent
                value={stateInventoryBuyTicket.amount}
                onChange={handleOnchange}
                name="amount"
              />
            </Form.Item>
            <Form.Item
              label="Price"
              name="price"
              rules={[{ required: true, message: 'Please input field!' }]}
            >
              <InputComponent
                value={stateInventoryBuyTicket.price}
                onChange={handleOnchange}
                name="price"
              />
            </Form.Item>
            <Form.Item label="Notes" name="note">
              <InputComponent
                value={stateInventoryBuyTicket.note}
                onChange={handleOnchange}
                name="note"
              />
            </Form.Item>
            <Form.Item wrapperCol={{ offset: 20, span: 16 }}>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Loading>
      </ModalComponent>
      <DrawerComponent
        title="Chi tiết phiếu nhập kho"
        isOpen={isOpenDrawer}
        onClose={() => setIsOpenDrawer(false)}
        width="90%"
      >
        <Loading isLoading={isLoadingUpdate || isLoadingUpdated}>
          <Form
            name="basic"
            labelCol={{ span: 2 }}
            wrapperCol={{ span: 22 }}
            onFinish={onUpdateInventoryBuyTicket}
            autoComplete="on"
            form={form}
          >
            <Form.Item
              label="Ticket Id"
              name="ticketId"
              rules={[{ required: true, message: 'Please input data!' }]}
            >
              <InputComponent
                value={stateInventoryBuyTicketDetails['ticketId']}
                onChange={handleOnchangeDetails}
                name="ticketId"
              />
            </Form.Item>
            <Form.Item
              label="Date"
              name="date"
              rules={[{ required: true, message: 'Please input data!' }]}
            >
              <InputComponent
                value={stateInventoryBuyTicketDetails['date']}
                onChange={handleOnchangeDetails}
                name="date"
              />
            </Form.Item>
            <Form.Item
              label="Inventory"
              name="inventory"
              rules={[{ required: true, message: 'Please input data!' }]}
            >
              <InputComponent
                value={stateInventoryBuyTicketDetails['inventory']}
                onChange={handleOnchangeDetails}
                name="inventory"
              />
            </Form.Item>

            <Form.Item label="Notes" name="note">
              <InputComponent
                value={stateInventoryBuyTicketDetails.note}
                onChange={handleOnchangeDetails}
                name="note"
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
      <ModalComponent
        title="Xóa phiếu nhập kho"
        open={isModalOpenDelete}
        onCancel={handleCancelDelete}
        onOk={handleDeleteInventoryBuyTicket}
      >
        <Loading isLoading={isLoadingDeleted}>
          <div>Bạn có chắc xóa phiếu này không?</div>
        </Loading>
      </ModalComponent>
    </div>
  );
};

export default AdminInventoryBuyTicket;
