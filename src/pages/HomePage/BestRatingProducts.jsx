import React from 'react';
import { WrapperButtonMore, WrapperProducts } from './style';

import CardComponent from '../../components/CardComponent/CardComponent';
import { useQuery } from '@tanstack/react-query';
import * as ProductService from '../../services/ProductService';
import { useState } from 'react';

const BestRatingProducts = () => {
  const [limit, setLimit] = useState(6);
  const sort = 'rating';

  const fetchProductAll = async (context) => {
    const limit = context?.queryKey && context?.queryKey[1];
    const search = context?.queryKey && context?.queryKey[2];
    const res = await ProductService.getAllProduct(search, limit, sort);

    return res;
  };

  const {
    isLoading,
    data: products,
    isPreviousData,
  } = useQuery(['products', limit, undefined, sort], fetchProductAll, {
    retry: 3,
    retryDelay: 1000,
    keepPreviousData: true,
  });

  return (
    <div>
      <h2>Sản phẩm đánh giá cao</h2>
      <WrapperProducts>
        {products?.data?.map((product) => {
          return (
            <CardComponent
              key={product._id}
              countInStock={product.countInStock}
              description={product.description}
              image={product.image}
              name={product.name}
              price={product.price}
              rating={product.rating}
              type={product.type}
              selled={product.selled}
              discount={product.discount}
              id={product._id}
            />
          );
        })}
      </WrapperProducts>
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          marginTop: '10px',
        }}
      >
        <WrapperButtonMore
          textbutton={isPreviousData ? 'Load more' : 'Xem thêm'}
          type="outline"
          styleButton={{
            border: `1px solid ${
              products?.total === products?.data?.length ? '#f5f5f5' : '#9255FD'
            }`,
            color: `${products?.total === products?.data?.length ? '#f5f5f5' : '#9255FD'}`,
            width: '240px',
            height: '38px',
            borderRadius: '4px',
          }}
          disabled={products?.total === products?.data?.length || products?.totalPage === 1}
          styleTextButton={{
            fontWeight: 500,
            color: products?.total === products?.data?.length && '#fff',
          }}
          onClick={() => setLimit((prev) => prev + 6)}
        />
      </div>
    </div>
  );
};

export default BestRatingProducts;
