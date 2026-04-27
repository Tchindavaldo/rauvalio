import React from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import HomeScreen from '../../screens/HomeScreen'
import ProductScreen from '../../screens/ProductScreen'
import CartScreen from '../../screens/CartScreen'
import CheckoutScreen from '../../screens/CheckoutScreen'
import LoginScreen from '../../screens/LoginScreen'

type ScreenKey = 'home' | 'product' | 'cart' | 'checkout' | 'login'
type Status = 'analyzed' | 'analyzing' | 'pending'

const screens: Record<ScreenKey, React.FC> = {
  home: HomeScreen,
  product: ProductScreen,
  cart: CartScreen,
  checkout: CheckoutScreen,
  login: LoginScreen,
}

const handleStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  width: 1,
  height: 1,
  minWidth: 1,
  minHeight: 1,
  pointerEvents: 'none',
}

export default function PhoneFrameNode(props: NodeProps) {
  const name = props.data.name as string
  const file = props.data.file as string
  const status = props.data.status as Status
  const screen = props.data.screen as ScreenKey
  const selected = props.data.selected as boolean | undefined

  const Screen = screens[screen]
  const statusColor =
    status === 'analyzed' ? 'var(--green)'
    : status === 'analyzing' ? 'var(--amber)'
    : 'var(--text-mute)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Phone shell */}
      <div className={`phone phone-hover${selected ? ' glow-pulse' : ''}`}>
        <div className="phone-screen">
          <div className="phone-notch" />
          <Screen />
        </div>
      </div>

      {/* Label */}
      <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{ width: 6, height: 6, borderRadius: 999, background: statusColor, display: 'inline-block' }}
            className={status === 'analyzing' ? 'pulse-dot' : ''}
          />
          <span style={{ fontWeight: 600, fontSize: 13, color: selected ? '#fff' : 'var(--text)' }}>
            {name}
          </span>
        </div>
        <div className="mono" style={{ fontSize: 10, color: 'var(--text-mute)' }}>{file}</div>
      </div>

      {/* === HANDLES === */}

      {/* Home: source tap-product (right ~340px), target from login (bottom) */}
      {screen === 'home' && (
        <>
          <Handle type="source" position={Position.Right} id="source-tap-product" style={{ ...handleStyle, top: 340 }} />
          <Handle type="target" position={Position.Bottom} id="target-bottom" style={{ ...handleStyle, left: 128 }} />
        </>
      )}

      {/* Product: target left (mid), source add-to-cart (right ~434px), source order-now (right ~472px) */}
      {screen === 'product' && (
        <>
          <Handle type="target" position={Position.Left} id="target-default" style={{ ...handleStyle, top: 248 }} />
          <Handle type="source" position={Position.Right} id="source-add-to-cart" style={{ ...handleStyle, top: 434 }} />
          <Handle type="source" position={Position.Right} id="source-order-now" style={{ ...handleStyle, top: 472 }} />
        </>
      )}

      {/* Cart: target left, source checkout-cta (bottom center) */}
      {screen === 'cart' && (
        <>
          <Handle type="target" position={Position.Left} id="target-default" style={{ ...handleStyle, top: 248 }} />
          <Handle type="source" position={Position.Bottom} id="source-checkout-cta" style={{ ...handleStyle, left: 128 }} />
        </>
      )}

      {/* Checkout: target left (from product), target top (from cart) */}
      {screen === 'checkout' && (
        <>
          <Handle type="target" position={Position.Left} id="target-left" style={{ ...handleStyle, top: 248 }} />
          <Handle type="target" position={Position.Top} id="target-top" style={{ ...handleStyle, left: 128 }} />
        </>
      )}

      {/* Login: target top (from product), source login-cta (left ~360px) */}
      {screen === 'login' && (
        <>
          <Handle type="target" position={Position.Top} id="target-top" style={{ ...handleStyle, left: 128 }} />
          <Handle type="source" position={Position.Left} id="source-login-cta" style={{ ...handleStyle, top: 360 }} />
        </>
      )}
    </div>
  )
}
