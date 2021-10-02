import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart')

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      // TODO

      //const storagedCart = localStorage.getItem('@RocketShoes:cart')
      // const cart = storagedCart ? JSON.parse(storagedCart) : []
      const cartBang = [...cart]
      const { data: { amount: amountItemInStock } } = await api.get(`stock/${productId}`)

      let indexProduct = cart.findIndex((product: Product) => product.id === productId)
      //console.log(indexProduct)

      if (indexProduct > -1) {

        const productInCart = cartBang[indexProduct]
        if (productInCart.amount < amountItemInStock) {
          productInCart.amount += 1
          cartBang[indexProduct] = productInCart
          setCart(cartBang)

          localStorage.setItem('@RocketShoes:cart', JSON.stringify(cartBang))

        } else {
          toast.error('Quantidade solicitada fora de estoque');
        }

      } else {
        const { data: product } = await api.get(`products/${productId}`)
        product.amount = 1
        cartBang.push(product)
        setCart(cartBang)

        localStorage.setItem('@RocketShoes:cart', JSON.stringify(cartBang))
      }

    } catch {
      // TODO
      toast.error('Erro na adição do produto')
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
      // const storagedCart = localStorage.getItem('@RocketShoes:cart')
      // const cart = storagedCart ? JSON.parse(storagedCart) : []
      const cartBang = [...cart]
      let indexProduct = cartBang.findIndex((product: Product) => product.id === productId)

      if (indexProduct > -1) {

        cartBang.splice(indexProduct, 1);
        setCart(cartBang)

        localStorage.setItem('@RocketShoes:cart', JSON.stringify(cartBang))

      } else {
        toast.error('Erro na remoção do produto');
      }


    } catch {
      // TODO
      toast.error('Erro na remoção do produto')
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
      // const storagedCart = localStorage.getItem('@RocketShoes:cart')
      // const cart = storagedCart ? JSON.parse(storagedCart) : []
      if (amount <= 0)
        return;

      const cartBang = [...cart]

      const { data: { amount: amountItemInStock } } = await api.get(`stock/${productId}`)

      let indexProduct = cartBang.findIndex((product: Product) => product.id === productId)
      //console.log(indexProduct)

      if (indexProduct > -1) {

        const productInCart = cartBang[indexProduct]
        if (amount <= amountItemInStock) {

          productInCart.amount = amount
          cart[indexProduct] = productInCart
          setCart(cartBang)

          localStorage.setItem('@RocketShoes:cart', JSON.stringify(cartBang))

        } else {
          toast.error('Quantidade solicitada fora de estoque');
        }

      } else {
        toast.error('Erro na alteração de quantidade do produto')
      }
    } catch {
      // TODO
      toast.error('Erro na alteração de quantidade do produto')
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
