import axios from 'axios';
import { axiosJWT } from './UserService';

export const getAllProduct = async (search, limit, sort) => {
  let res = {};
  let sorting = '';
  if (sort) {
    sorting = `&sort=-1&sort=${sort}`;
  }
  if (search?.length > 0) {
    res = await axios.get(
      `${process.env.REACT_APP_API_URL}/product/get-all?filter=name&filter=${search}&limit=${limit}${sorting}`,
    );
  } else {
    res = await axios.get(
      `${process.env.REACT_APP_API_URL}/product/get-all?limit=${limit}${sorting}`,
    );
  }
  return res.data;
};

export const getProductType = async (type, page, limit) => {
  if (type) {
    const res = await axios.get(
      `${process.env.REACT_APP_API_URL}/product/get-all?filter=type&filter=${type}&limit=${limit}&page=${page}`,
    );
    return res.data;
  }
};

export const createProduct = async (data) => {
  const res = await axios.post(`${process.env.REACT_APP_API_URL}/product/create`, data);
  return res.data;
};

export const getDetailsProduct = async (id) => {
  const res = await axios.get(`${process.env.REACT_APP_API_URL}/product/get-details/${id}`);
  return res.data;
};

export const updateProduct = async (id, access_token, data) => {
  const res = await axiosJWT.put(`${process.env.REACT_APP_API_URL}/product/update/${id}`, data, {
    headers: {
      token: `Bearer ${access_token}`,
    },
  });
  return res.data;
};

export const deleteProduct = async (id, access_token) => {
  const res = await axiosJWT.delete(`${process.env.REACT_APP_API_URL}/product/delete/${id}`, {
    headers: {
      token: `Bearer ${access_token}`,
    },
  });
  return res.data;
};

export const deleteManyProduct = async (data, access_token) => {
  const res = await axiosJWT.post(`${process.env.REACT_APP_API_URL}/product/delete-many`, data, {
    headers: {
      token: `Bearer ${access_token}`,
    },
  });
  return res.data;
};

export const getAllTypeProduct = async () => {
  const res = await axios.get(`${process.env.REACT_APP_API_URL}/product/get-all-type`);
  return res.data;
};
