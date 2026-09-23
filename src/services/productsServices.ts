import {AppDispatch} from '../redux/store'; // adjust path if needed
import {productActions} from '../redux/slices/productSlice';
import axiosInstance from '../Api/axiosInstance';
import {
  getProductsFromDatabase,
  getProductsGroupedFromDatabase,
  getProductById,
  updateProduct,
  createProduct,
} from '../database/productRepository';
import {getCategoriesFromDatabase} from '../database/categoryRepository';

// Types
type Variant = {
  size: string;
  price: string;
};

type VariantMap = {
  hot: Variant[];
  cold: Variant[];
  blended: Variant[];
};

export type ProductFormData = {
  name: string;
  description: string;
  category_id: string;
  variants: VariantMap;
};

export const getProducts = () => {
  return async (dispatch: AppDispatch) => {
    dispatch(productActions.productStart());

    axiosInstance
      .get('/products')
      .then(response => {
        if (response?.status === 200) {
          return dispatch(productActions.productSuccess(response?.data));
        }

        return dispatch(productActions.productFailed(response.data.error));
      })
      .catch(error => {
        return dispatch(productActions.productFailed(error.data.error));
      });
  };
};

export const resetProducts = () => {
  return (dispatch: AppDispatch) => {
    dispatch(productActions.resetProducts());
  };
};

export const addProducts: any = (payload: any) => {
  return (dispatch: AppDispatch) => {
    dispatch(productActions.addProductStart());
    createProduct(payload)
      .then(response => {
        if (response) {
          return dispatch(productActions.addProductSuccess(response));
        }

        return dispatch(productActions.addProductFailed(response));
      })
      .catch(error => {
        dispatch(productActions.addProductFailed(error));
      });
  };
};

export const getProduct: any = (productId: number) => {
  return (dispatch: AppDispatch) => {
    dispatch(productActions.getProductStart());

    axiosInstance
      .put(`/products/${productId}`)
      .then(response => {
        if (response.status === 200 || response.status === 201) {
          dispatch(productActions.getProductSuccess(response.data));
          return;
        }

        return dispatch(productActions.getProductFailed(response.data));
      })
      .catch(error => {
        return dispatch(productActions.getProductFailed(error));
      });
  };
};

export const getProductByIdLocal = (productId: number) => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(productActions.getProductStart());

      const product = await getProductById(productId);

      if (!product) {
        throw new Error(`Product with ID ${productId} not found`);
      }

      dispatch(productActions.getProductSuccess(product));
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      dispatch(
        productActions.getProductFailed(
          error instanceof Error ? error.message : 'Failed to fetch product',
        ),
      );
    }
  };
};

export const editProducts: any = (productId: number, payload: any) => {
  return (dispatch: AppDispatch) => {
    dispatch(productActions.updateProductStart());

    axiosInstance
      .put(`/products/${productId}`, payload)
      .then(response => {
        if (response.status === 200 || response.status === 201) {
          dispatch(productActions.updateProductSuccess(response.data));
          return;
        }

        return dispatch(productActions.updateProductFailed(response.data));
      })
      .catch(error => {
        return dispatch(productActions.updateProductFailed(error));
      });
  };
};

export const editProductsLocal: any = (productId: number, payload: any) => {
  return (dispatch: AppDispatch) => {
    dispatch(productActions.updateProductStart());

    // axiosInstance
    //   .put(`/products/${productId}`, payload)
    //   .then(response => {
    //     if (response.status === 200 || response.status === 201) {
    //       dispatch(productActions.updateProductSuccess(response.data));
    //       return;
    //     }

    //     return dispatch(productActions.updateProductFailed(response.data));
    //   })
    //   .catch(error => {
    //     return dispatch(productActions.updateProductFailed(error));
    //   });

    updateProduct(productId, payload)
      .then(response => {
        // if (response.status === 200 || response.status === 201) {
        // dispatch(productActions.updateProductSuccess(response.data));
        // return;
        // }
        if (response) {
          dispatch(productActions.updateProductSuccess(response));
          return;
        }

        return dispatch(productActions.updateProductFailed(response));
      })
      .catch(error => {
        return dispatch(productActions.updateProductFailed(error));
      });
  };
};

export const getCategories = () => {
  return (dispatch: AppDispatch) => {
    dispatch(productActions.getCategoriesStart());

    getCategoriesFromDatabase()
      .then(response => {
        if (response) {
          return dispatch(productActions.getCategoriesSuccess(response));
        }

        return dispatch(productActions.getCategoriesFailed(response));
      })
      .catch(error => {
        return dispatch(productActions.getCategoriesFailed(error));
      });
  };
};

export const getProductCategories = () => {
  return (dispatch: AppDispatch) => {
    dispatch(productActions.getSubCategoriesStart());
    axiosInstance
      .get('/product-categories')
      .then(response => {
        if (response?.status === 200) {
          return dispatch(
            productActions.getSubCategoriesSuccess(response?.data),
          );
        }

        return dispatch(
          productActions.getSubCategoriesFailed(response.data.error),
        );
      })
      .catch(error => {
        return dispatch(
          productActions.getSubCategoriesFailed(error.data.error),
        );
      });
  };
};

export const getProductsGrouped = () => {
  return (dispatch: AppDispatch) => {
    dispatch(productActions.getProductsGroupedStart());
    axiosInstance
      .get('/products/grouped')
      .then(response => {
        if (response?.status === 200) {
          return dispatch(
            productActions.getProductsGroupedSuccess(response?.data),
          );
        }

        return dispatch(
          productActions.getProductsGroupedFailed(response.data.error),
        );
      })
      .catch(error => {
        return dispatch(
          productActions.getProductsGroupedFailed(error.data.error),
        );
      });
  };
};

export const getProductsGroupedLocal = () => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(productActions.getProductsGroupedStart());

      const products = await getProductsGroupedFromDatabase();

      console.log('[Products] Loaded local products:', products);

      dispatch(productActions.getProductsGroupedSuccess(products));
    } catch (error) {
      console.error('[Products] Failed to load local products:', error);

      dispatch(
        productActions.getProductsGroupedFailed(
          error instanceof Error
            ? error.message
            : 'Failed to load local products',
        ),
      );
    }
  };
};

export const addProductCategory: any = (payload: any) => {
  return (dispatch: AppDispatch) => {
    dispatch(productActions.addProductCategoryStart());
    axiosInstance
      .post('/product-categories', payload)
      .then(response => {
        if (response?.status === 200 || response?.status === 201) {
          return dispatch(
            productActions.addProductCategorySuccess(response?.data),
          );
        }

        return dispatch(productActions.addProductCategoryFailed(response));
      })
      .catch(error => {
        dispatch(productActions.addProductCategoryFailed(error));
      });
  };
};

export const resetCategories = () => {
  return (dispatch: AppDispatch) => {
    dispatch(productActions.resetCategories());
  };
};

export const resetAddProductState: any = () => {
  return (dispatch: AppDispatch) => {
    dispatch(productActions.resetAddProductState());
  };
};

export const resetProductCategories: any = () => {
  return (dispatch: AppDispatch) => {
    dispatch(productActions.resetProductCategories());
  };
};

export const resetError: any = () => {
  return (dispatch: AppDispatch) => {
    dispatch(productActions.resetError());
  };
};

export const resetUpdateProduct: any = () => {
  return (dispatch: AppDispatch) => {
    dispatch(productActions.resetUpdateProduct());
  };
};
