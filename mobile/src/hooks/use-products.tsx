import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { getProducts } from '@/lib/api';
import type { Product, ProductsState } from '@/types';

const ProductsContext = createContext<ProductsState | null>(null);

export function ProductsProvider({ children }: PropsWithChildren) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      setProducts(await getProducts());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Current product information is unavailable.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const value = useMemo(() => ({
    products,
    loading,
    refreshing,
    error,
    refresh: () => loadProducts(true),
  }), [products, loading, refreshing, error, loadProducts]);

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export const useProducts = (): ProductsState => {
  const context = useContext(ProductsContext);
  if (!context) throw new Error('useProducts must be used within ProductsProvider');
  return context;
};
