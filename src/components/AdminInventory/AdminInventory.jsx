import { Button, Form, Space } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons';
import React, { useRef } from 'react';
import { WrapperHeader } from './style';
import TableComponent from '../TableComponent/TableComponent';
import { useState } from 'react';
import InputComponent from '../InputComponent/InputComponent';
import * as InventoryService from '../../services/InventoryService';
import { useMutationHooks } from '../../hooks/useMutationHook';
import Loading from '../../components/LoadingComponent/Loading';
import { useEffect } from 'react';
import * as message from '../../components/Message/Message';
import { useQuery } from '@tanstack/react-query';
import DrawerComponent from '../DrawerComponent/DrawerComponent';
import { useSelector } from 'react-redux';
import ModalComponent from '../ModalComponent/ModalComponent';

const AdminInventory = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rowSelected, setRowSelected] = useState('');
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);
  const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
  const user = useSelector((state) => state?.user);
  const searchInput = useRef(null);
  const inittial = () => ({
    name: '',
    address: '',
    keeper: '',
    maxAmount: 1,
  });
  const [stateInventory, setStateInventory] = useState(inittial());
  const [stateInventoryDetails, setStateInventoryDetails] = useState(inittial());

  const [form] = Form.useForm();

  const mutation = useMutationHooks((data) => {
    const { name, address, keeper, maxAmount } = data;
    const res = InventoryService.createInventory({
      name,
      address,
      keeper,
      maxAmount,
    });
    return res;
  });
  const mutationUpdate = useMutationHooks((data) => {
    const { id, token, ...rests } = data;
    const res = InventoryService.updateInventory(id, token, { ...rests });
    return res;
  });

  const mutationDeleted = useMutationHooks((data) => {
    const { id, token } = data;
    const res = InventoryService.deleteInventory(id, token);
    return res;
  });

  const mutationDeletedMany = useMutationHooks((data) => {
    const { token, ...ids } = data;
    const res = InventoryService.deleteManyInventory(ids, token);
    return res;
  });

  const getAllInventorys = async () => {
    const res = await InventoryService.getAllInventory();
    return res;
  };

  const fetchGetDetailsInventory = async (rowSelected) => {
    const res = await InventoryService.getDetailsInventory(rowSelected);
    if (res?.data) {
      setStateInventoryDetails({
        name: res?.data?.name,
        address: res?.data?.address,
        keeper: res?.data?.keeper,
        maxAmount: res?.data?.maxAmount,
      });
    }
    setIsLoadingUpdate(false);
  };

  useEffect(() => {
    if (!isModalOpen) {
      form.setFieldsValue(stateInventoryDetails);
    } else {
      form.setFieldsValue(inittial());
    }
  }, [form, stateInventoryDetails, isModalOpen]);

  useEffect(() => {
    if (rowSelected && isOpenDrawer) {
      setIsLoadingUpdate(true);
      fetchGetDetailsInventory(rowSelected);
    }
  }, [rowSelected, isOpenDrawer]);

  const handleDetailsInventory = () => {
    setIsOpenDrawer(true);
  };

  const handleDelteManyInventorys = (ids) => {
    mutationDeletedMany.mutate(
      { ids: ids, token: user?.access_token },
      {
        onSettled: () => {
          queryInventory.refetch();
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

  const queryInventory = useQuery({
    queryKey: ['inventories'],
    queryFn: getAllInventorys,
  });

  const { isLoading: isLoadingInventorys, data: inventories } = queryInventory;
  const renderAction = () => {
    return (
      <div>
        <DeleteOutlined
          style={{ color: 'red', fontSize: '30px', cursor: 'pointer' }}
          onClick={() => setIsModalOpenDelete(true)}
        />
        <EditOutlined
          style={{ color: 'orange', fontSize: '30px', cursor: 'pointer' }}
          onClick={handleDetailsInventory}
        />
      </div>
    );
  };

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    // setSearchText(selectedKeys[0]);
    // setSearchedColumn(dataIndex);
  };
  const handleReset = (clearFilters) => {
    clearFilters();
    // setSearchText('');
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
      title: 'Name',
      dataIndex: 'name',
      sorter: (a, b) => a.name.length - b.name.length,
      ...getColumnSearchProps('name'),
    },
    {
      title: 'Address',
      dataIndex: 'address',
      sorter: (a, b) => a.address.length - b.address.length,
      ...getColumnSearchProps('address'),
    },
    {
      title: 'Keeper',
      dataIndex: 'keeper',
      sorter: (a, b) => a.keeper - b.keeper,
      ...getColumnSearchProps('keeper'),
    },
    {
      title: 'Max Amount',
      dataIndex: 'maxAmount',
      sorter: (a, b) => a.maxAmount - b.maxAmount,
      ...getColumnSearchProps('maxAmount'),
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
      return { ...inventory, key: inventory._id };
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
    setStateInventoryDetails({
      name: '',
      address: '',
      keeper: '',
      maxAmount: 1,
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

  const handleDeleteInventory = () => {
    mutationDeleted.mutate(
      { id: rowSelected, token: user?.access_token },
      {
        onSettled: () => {
          queryInventory.refetch();
        },
      },
    );
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setStateInventory({
      name: '',
      address: '',
      keeper: '',
      maxAmount: 1,
    });
    form.resetFields();
  };

  const onFinish = () => {
    const params = {
      name: stateInventory.name,
      address: stateInventory.address,
      keeper: stateInventory.keeper,
      maxAmount: stateInventory.maxAmount,
    };
    mutation.mutate(params, {
      onSettled: () => {
        queryInventory.refetch();
      },
    });
  };

  const handleOnchange = (e) => {
    setStateInventory({
      ...stateInventory,
      [e.target.name]: e.target.value,
    });
  };

  const handleOnchangeDetails = (e) => {
    setStateInventoryDetails({
      ...stateInventoryDetails,
      [e.target.name]: e.target.value,
    });
  };

  const onUpdateInventory = () => {
    mutationUpdate.mutate(
      { id: rowSelected, token: user?.access_token, ...stateInventoryDetails },
      {
        onSettled: () => {
          queryInventory.refetch();
        },
      },
    );
  };

  return (
    <div>
      <WrapperHeader>Quản lý kho</WrapperHeader>
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
          handleDelteMany={handleDelteManyInventorys}
          columns={columns}
          isLoading={isLoadingInventorys}
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
        title="Tạo kho moi"
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
              label="Name"
              name="name"
              rules={[{ required: true, message: 'Please input name!' }]}
            >
              <InputComponent
                value={stateInventory['name']}
                onChange={handleOnchange}
                name="name"
              />
            </Form.Item>
            <Form.Item
              label="Address"
              name="address"
              rules={[{ required: true, message: 'Please input address!' }]}
            >
              <InputComponent
                value={stateInventory.address}
                onChange={handleOnchange}
                name="address"
              />
            </Form.Item>
            <Form.Item
              label="Keeper"
              name="keeper"
              rules={[{ required: true, message: 'Please input keeper!' }]}
            >
              <InputComponent
                value={stateInventory.keeper}
                onChange={handleOnchange}
                name="keeper"
              />
            </Form.Item>
            <Form.Item
              label="Max Amount"
              name="maxAmount"
              rules={[{ required: true, message: 'Please input max amount!' }]}
            >
              <InputComponent
                value={stateInventory.maxAmount}
                onChange={handleOnchange}
                name="maxAmount"
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
        title="Chi tiết kho"
        isOpen={isOpenDrawer}
        onClose={() => setIsOpenDrawer(false)}
        width="90%"
      >
        <Loading isLoading={isLoadingUpdate || isLoadingUpdated}>
          <Form
            name="basic"
            labelCol={{ span: 2 }}
            wrapperCol={{ span: 22 }}
            onFinish={onUpdateInventory}
            autoComplete="on"
            form={form}
          >
            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true, message: 'Please input data!' }]}
            >
              <InputComponent
                value={stateInventoryDetails['name']}
                onChange={handleOnchangeDetails}
                name="name"
              />
            </Form.Item>
            <Form.Item
              label="Address"
              name="address"
              rules={[{ required: true, message: 'Please input data!' }]}
            >
              <InputComponent
                value={stateInventoryDetails['address']}
                onChange={handleOnchangeDetails}
                name="address"
              />
            </Form.Item>
            <Form.Item
              label="Keeper"
              name="keeper"
              rules={[{ required: true, message: 'Please input data!' }]}
            >
              <InputComponent
                value={stateInventoryDetails['keeper']}
                onChange={handleOnchangeDetails}
                name="keeper"
              />
            </Form.Item>

            <Form.Item
              label="Max Amount"
              name="maxAmount"
              rules={[
                {
                  required: true,
                  message: 'Please input data!',
                },
              ]}
            >
              <InputComponent
                value={stateInventoryDetails.maxAmount}
                onChange={handleOnchangeDetails}
                name="maxAmount"
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
        title="Xóa kho"
        open={isModalOpenDelete}
        onCancel={handleCancelDelete}
        onOk={handleDeleteInventory}
      >
        <Loading isLoading={isLoadingDeleted}>
          <div>Bạn có chắc xóa kho này không?</div>
        </Loading>
      </ModalComponent>
    </div>
  );
};

export default AdminInventory;
