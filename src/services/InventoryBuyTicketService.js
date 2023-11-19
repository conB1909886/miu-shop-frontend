import axios from 'axios';

export const axiosJWT = axios.create();

export const createInventoryBuyTicket = async (data, access_token) => {
  const res = await axiosJWT.post(
    `${process.env.REACT_APP_API_URL}/inventory-buy-ticket/create`,
    data,
    {
      headers: {
        token: `Bearer ${access_token}`,
      },
    },
  );
  return res.data;
};

export const updateInventoryBuyTicket = async (id, access_token, data) => {
  const res = await axiosJWT.put(
    `${process.env.REACT_APP_API_URL}/inventory-buy-ticket/update/${id}`,
    data,
    {
      headers: {
        token: `Bearer ${access_token}`,
      },
    },
  );
  return res.data;
};

export const getInventoryBuyTicketByUserId = async (id, access_token) => {
  const res = await axiosJWT.get(
    `${process.env.REACT_APP_API_URL}/inventory-buy-ticket/get-all/${id}`,
    {
      headers: {
        token: `Bearer ${access_token}`,
      },
    },
  );
  return res.data;
};

export const getDetailsInventoryBuyTicket = async (id, access_token) => {
  const res = await axiosJWT.get(
    `${process.env.REACT_APP_API_URL}/inventory-buy-ticket/get-details/${id}`,
    {
      headers: {
        token: `Bearer ${access_token}`,
      },
    },
  );
  return res.data;
};

export const getAllInventoryBuyTicket = async (access_token) => {
  const res = await axiosJWT.get(`${process.env.REACT_APP_API_URL}/inventory-buy-ticket/get-all`, {
    headers: {},
  });
  return res.data;
};

export const deleteInventoryBuyTicket = async (id, access_token) => {
  const res = await axiosJWT.delete(
    `${process.env.REACT_APP_API_URL}/inventory-buy-ticket/delete/${id}`,
    {
      headers: {
        token: `Bearer ${access_token}`,
      },
    },
  );
  return res.data;
};

export const deleteManyInventoryBuyTicket = async (data, access_token) => {
  const res = await axiosJWT.post(
    `${process.env.REACT_APP_API_URL}/inventory-buy-ticket/delete-many`,
    data,
    {
      headers: {
        token: `Bearer ${access_token}`,
      },
    },
  );
  return res.data;
};
