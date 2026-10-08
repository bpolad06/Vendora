import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  NavLink,
  Navigate,
  Outlet,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Package,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Store,
  Trash2,
  Users,
  X,
  Star,
  Truck,
  Pencil,
  ImagePlus,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { CATEGORIES } from '../data/categories';
import { VUQAR_ID } from '../data/sellers';
import type { Product, CategorySlug, Order, OrderStatus, Seller } from '../data/types';
import { unitPriceFor, shippingFor } from '../lib/pricing';
import { formatAZN } from '../lib/format';
import { useAuth, currentUser, roleHome, initializeDemo, type Role } from './auth';
import { useCart } from './cart';
import { productImage, imageFallback } from './productImages';
import './vendora.css';

const roles = { admin: 'Admin', seller: 'Satıcı', buyer: 'Alıcı' };
const statuses: OrderStatus[] = ['Yeni', 'Hazırlanır', 'Göndərildi', 'Çatdırıldı', 'Ləğv edildi'];
const demoReady = initializeDemo(VUQAR_ID);
function useCurrentUser() {
  const a = useAuth();
  return a.accounts.find((u) => u.id === a.userId);
}
function Photo({
  product,
  className = '',
}: {
  product: Pick<Product, 'image' | 'category' | 'name'> & Partial<Pick<Product, 'art'>>;
  className?: string;
}) {
  return (
    <img
      className={className}
      src={productImage(product)}
      alt={product.name}
      loading="lazy"
      onError={(e) => {
        if (!e.currentTarget.src.endsWith(imageFallback)) e.currentTarget.src = imageFallback;
      }}
    />
  );
}
function Empty({ text, children }: { text: string; children?: ReactNode }) {
  return (
    <div className="v-empty">
      <Package size={38} />
      <h3>{text}</h3>
      {children}
    </div>
  );
}
function Title({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="v-title">
      <div>
        <p className="v-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
      </div>
      {children}
    </div>
  );
}
function Guard({ role }: { role: Role }) {
  const user = useCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={roleHome(user.role)} replace />;
  return <Outlet />;
}
function Brand({ full = false }: { full?: boolean }) {
  return (
    <Link
      to="/"
      className={full ? 'v-brand v-brand-full' : 'v-brand'}
      aria-label="Vendora ana səhifə"
    >
      {full ? (
        <img className="v-full-logo" src="/logo.png" alt="Vendora — Your Marketplace Partner" />
      ) : (
        <>
          <span>
            <img className="v-logo-mark" src="/logo-mark.png" alt="" />
          </span>
          Vendora
        </>
      )}
    </Link>
  );
}

function MarketShell() {
  const user = useCurrentUser();
  const auth = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const carts = useCart((s) => s.carts);
  const count = Object.values(carts[user?.id || 'guest'] || {}).reduce((a, b) => a + b, 0);
  return (
    <div className="v-app">
      <div className="v-topline">
        <span>Yerli biznes. Böyük imkanlar.</span>
        <Link to={user?.role === 'seller' ? '/seller' : '/signup?role=seller'}>
          Vendora-da satış et <ArrowUpRight size={13} />
        </Link>
      </div>
      <header className="v-market-header">
        <Brand />
        <form
          className="v-search"
          onSubmit={(e) => {
            e.preventDefault();
            navigate('/search?q=' + encodeURIComponent(query));
          }}
        >
          <Search size={19} />
          <input
            aria-label="Məhsul axtar"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nə axtarırsınız?"
          />
          <button type="submit">Axtar</button>
        </form>
        <div className="v-header-actions">
          {user ? (
            <>
              <Link className="v-account" to={roleHome(user.role)}>
                <span className="v-avatar">{user.name[0]}</span>
                <span>
                  {user.name.split(' ')[0]}
                  <small>{roles[user.role]} hesabı</small>
                </span>
              </Link>
              <button
                className="v-icon-btn"
                aria-label="Çıxış"
                onClick={() => {
                  auth.logout();
                  navigate('/');
                }}
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <Link to="/login" className="v-login-link">
              Daxil ol / Qeydiyyat
            </Link>
          )}
          <Link to="/cart" className="v-cart-link" aria-label="Səbət">
            <ShoppingCart size={22} />
            {count > 0 && <b>{count}</b>}
          </Link>
        </div>
      </header>
      <nav className="v-categories">
        <Link to="/search">Bütün məhsullar</Link>
        {CATEGORIES.map((c) => (
          <Link key={c.slug} to={'/c/' + c.slug}>
            {c.name}
          </Link>
        ))}
      </nav>
      <main className="v-market-main">
        <Outlet />
      </main>
      <footer className="v-footer">
        <Brand />
        <p>Azərbaycan biznesini bir araya gətiririk.</p>
        <span>© {new Date().getFullYear()} Vendora</span>
        <small>Demo platforma · sifarişlər və hesablar bu brauzerdə saxlanılır.</small>
      </footer>
    </div>
  );
}
function WorkspaceShell({ role }: { role: 'admin' | 'seller' }) {
  const user = useCurrentUser();
  const auth = useAuth();
  const store = useStore();
  const navigate = useNavigate();
  const seller = store.sellers.find((s) => s.id === user?.sellerId);
  const base = '/' + role;
  const tabs =
    role === 'admin'
      ? ([
          ['', 'İcmal', LayoutDashboard],
          ['/products', 'Məhsullar', Package],
          ['/orders', 'Sifarişlər', ShoppingBag],
          ['/sellers', 'Satıcılar', Store],
          ['/users', 'İstifadəçilər', Users],
        ] as const)
      : ([
          ['', 'İcmal', LayoutDashboard],
          ['/products', 'Məhsullarım', Package],
          ['/orders', 'Sifarişlərim', ShoppingBag],
          ['/profile', 'Mağazam', Store],
        ] as const);
  return (
    <div className="v-app v-workspace">
      <aside className="v-sidebar">
        <Brand />
        <div className="v-workspace-label">
          {role === 'admin' ? 'İDARƏETMƏ MƏRKƏZİ' : 'SATICI MƏRKƏZİ'}
        </div>
        <nav>
          {tabs.map(([path, label, Icon]) => (
            <NavLink end={path === ''} to={base + path} key={path}>
              <Icon size={19} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="v-sidebar-bottom">
          <Link to="/">
            <ArrowUpRight size={18} />
            Marketplace-ə keç
          </Link>
          <button
            onClick={() => {
              auth.logout();
              navigate('/login');
            }}
          >
            <LogOut size={18} />
            Hesabdan çıx
          </button>
          <small>Vendora Biznes · Demo</small>
        </div>
      </aside>
      <div className="v-workspace-body">
        <header className="v-workspace-header">
          <span>
            {role === 'admin' ? 'Platformanın idarəetməsi' : seller?.name || 'Mənim mağazam'}
          </span>
          <Link to={roleHome(role)} className="v-account">
            <span className="v-avatar">{user?.name[0]}</span>
            <span>
              {user?.name}
              <small>{roles[role]}</small>
            </span>
          </Link>
        </header>
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
function ProductCard({ p }: { p: Product }) {
  const seller = useStore((s) => s.sellers.find((x) => x.id === p.sellerId));
  const price = unitPriceFor(p, p.minOrder);
  return (
    <Link to={'/p/' + p.id} className="v-product-card">
      <div className="v-product-photo">
        <Photo product={p} />
        {p.tiers.length > 1 && <span className="v-photo-tag">TOPDAN</span>}
        <span className="v-photo-arrow">
          <ArrowUpRight size={18} />
        </span>
      </div>
      <div className="v-product-copy">
        <small>{seller?.name}</small>
        <h3>{p.name}</h3>
        <div className="v-product-price">
          <strong>{formatAZN(price)}</strong>
          <span>/ {p.unit}</span>
        </div>
        <div className="v-product-meta">
          <span>
            <Star size={12} fill="currentColor" /> {p.rating}
          </span>
          <span>{p.stock > 0 ? 'Stokda var' : 'Stok bitib'}</span>
        </div>
      </div>
    </Link>
  );
}
function MarketHome() {
  const store = useStore();
  const products = store.products.filter((p) => p.published);
  const [category, setCategory] = useState('');
  const visible = (category ? products.filter((p) => p.category === category) : products).slice(
    0,
    12,
  );
  return (
    <>
      <section className="v-hero">
        <div className="v-hero-copy">
          <span className="v-hero-badge">
            <span /> AZƏRBAYCANIN BİZNES MARKETPLACE-İ
          </span>
          <h1>
            Biznesiniz üçün.
            <br />
            <em>Birbaşa mənbədən.</em>
          </h1>
          <p>
            Sədərəkdən, Binədən və yerli mağazalardan topdan və pərakəndə alış-veriş. Minlərlə
            məhsul, bir platforma.
          </p>
          <Link className="v-btn v-btn-light" to="/search">
            Məhsulları kəşf et <ArrowRight size={18} />
          </Link>
          <div className="v-hero-stats">
            <span>
              <b>{products.length}+</b>məhsul
            </span>
            <span>
              <b>{store.sellers.length}</b>yerli satıcı
            </span>
            <span>
              <b>₼</b>yerli qiymətlər
            </span>
          </div>
        </div>
        <div className="v-hero-art">
          <img
            src="/products/qab-qacaq.jpg"
            alt="Mətbəx və ev üçün məhsullar"
            onError={(e) => {
              e.currentTarget.src = imageFallback;
            }}
          />
          <div className="v-hero-art-label">
            <Store size={24} />
            <div>
              <b>Yerli satıcılardan</b>
              <span>Topdan qiymətlər, geniş seçim</span>
            </div>
            <ArrowUpRight size={20} />
          </div>
        </div>
      </section>
      <div className="v-trust-strip">
        <span>
          <ShieldCheck />
          Satıcı profilləri
        </span>
        <span>
          <Package />
          Topdan və pərakəndə
        </span>
        <span>
          <Truck />
          Çatdırılma seçimi
        </span>
        <span>
          <Store />
          Yerli biznesə dəstək
        </span>
      </div>
      <section>
        <Title eyebrow="SİZİN ÜÇÜN SEÇDİK" title="Bazarı kəşf edin">
          <Link to="/search" className="v-text-link">
            Hamısına bax <ArrowRight size={16} />
          </Link>
        </Title>
        <div className="v-filter-chips">
          <button className={!category ? 'active' : ''} onClick={() => setCategory('')}>
            Hamısı
          </button>
          {CATEGORIES.map((c) => (
            <button
              className={category === c.slug ? 'active' : ''}
              onClick={() => setCategory(c.slug)}
              key={c.slug}
            >
              {c.name}
            </button>
          ))}
        </div>
        <div className="v-product-grid">
          {visible.map((p) => (
            <ProductCard p={p} key={p.id} />
          ))}
        </div>
      </section>
      <section className="v-seller-banner">
        <div>
          <p className="v-eyebrow">VENDORA BİZNES</p>
          <h2>Mağazanızın növbəti addımı.</h2>
          <p>Məhsullarınızı idarə edin, onlayn satışa başlayın.</p>
        </div>
        <Link to="/signup?role=seller" className="v-btn">
          Satıcı hesabı yarat <ArrowRight size={18} />
        </Link>
      </section>
    </>
  );
}
function Catalog() {
  const store = useStore();
  const { slug } = useParams();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const category = slug || params.get('category') || '';
  const sort = params.get('sort') || 'popular';
  let products = store.products.filter(
    (p) =>
      p.published &&
      (!category || p.category === category) &&
      (!q ||
        (p.name + ' ' + p.sku + ' ' + (store.sellers.find((s) => s.id === p.sellerId)?.name || ''))
          .toLocaleLowerCase('az')
          .includes(q.toLocaleLowerCase('az'))),
  );
  products = [...products].sort((a, b) =>
    sort === 'price-low'
      ? unitPriceFor(a, a.minOrder) - unitPriceFor(b, b.minOrder)
      : sort === 'price-high'
        ? unitPriceFor(b, b.minOrder) - unitPriceFor(a, a.minOrder)
        : sort === 'new'
          ? b.createdAt - a.createdAt
          : b.soldCount - a.soldCount,
  );
  function update(key: string, value: string) {
    const next = new URLSearchParams(params);
    next.set(key, value);
    setParams(next);
  }
  return (
    <>
      <Title
        eyebrow="MARKETPLACE"
        title={CATEGORIES.find((c) => c.slug === category)?.name || 'Bütün məhsullar'}
      />
      <div className="v-catalog-toolbar">
        <div className="v-search">
          <Search size={18} />
          <input
            aria-label="Kataloqda axtar"
            value={q}
            onChange={(e) => update('q', e.target.value)}
            placeholder="Məhsul və ya satıcı axtar"
          />
        </div>
        {!slug && (
          <select
            aria-label="Kateqoriya"
            value={category}
            onChange={(e) => update('category', e.target.value)}
          >
            <option value="">Bütün kateqoriyalar</option>
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        )}
        <select aria-label="Sıralama" value={sort} onChange={(e) => update('sort', e.target.value)}>
          <option value="popular">Ən çox satılan</option>
          <option value="price-low">Ucuzdan bahaya</option>
          <option value="price-high">Bahadan ucuza</option>
          <option value="new">Ən yeni</option>
        </select>
        <span>{products.length} məhsul</span>
      </div>
      {products.length ? (
        <div className="v-product-grid">
          {products.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      ) : (
        <Empty text="Axtarışınıza uyğun məhsul yoxdur." />
      )}
    </>
  );
}
function ProductDetail() {
  const { id } = useParams();
  const store = useStore();
  const user = useCurrentUser();
  const navigate = useNavigate();
  const cart = useCart();
  const p = store.products.find((x) => x.id === id && x.published);
  const [qty, setQty] = useState(p?.minOrder || 1);
  const [added, setAdded] = useState(false);
  useEffect(() => {
    setQty(p?.minOrder || 1);
    setAdded(false);
  }, [id, p?.minOrder]);
  if (!p)
    return (
      <Empty text="Məhsul tapılmadı və ya satışdan çıxarılıb.">
        <Link to="/search">Kataloqa qayıt</Link>
      </Empty>
    );
  const seller = store.sellers.find((s) => s.id === p.sellerId)!;
  const price = unitPriceFor(p, qty);
  const valid = Number.isInteger(qty) && qty >= p.minOrder && qty <= p.stock;
  function add() {
    if (!valid) return;
    if (user && user.role !== 'buyer') return;
    const owner = user?.id || 'guest';
    const existing = cart.carts[owner]?.[p!.id] || 0;
    cart.setQty(owner, p!.id, Math.min(p!.stock, existing + qty));
    setAdded(true);
  }
  return (
    <>
      <div className="v-breadcrumb">
        <Link to="/">Ana səhifə</Link>
        <ChevronRight size={14} />
        <Link to={'/c/' + p.category}>{CATEGORIES.find((c) => c.slug === p.category)?.name}</Link>
        <ChevronRight size={14} />
        <span>{p.name}</span>
      </div>
      <div className="v-detail">
        <div className="v-detail-photo">
          <Photo product={p} />
        </div>
        <div className="v-detail-copy">
          <p className="v-eyebrow">{p.sku}</p>
          <h1>{p.name}</h1>
          <div className="v-detail-rating">
            <Star size={16} fill="currentColor" /> {p.rating}{' '}
            <span>
              · {p.reviewCount} rəy · {p.soldCount} satış
            </span>
          </div>
          <p>{p.description}</p>
          <div className="v-detail-price">
            {formatAZN(price)}
            <small> / {p.unit}</small>
          </div>
          <div className="v-tiers">
            {p.tiers.map((t) => (
              <button
                className={price === t.price ? 'active' : ''}
                key={t.min}
                onClick={() => setQty(Math.max(t.min, p.minOrder))}
              >
                <span>
                  {t.min}+ {p.unit}
                </span>
                <b>{formatAZN(t.price)}</b>
              </button>
            ))}
          </div>
          <div className="v-quantity-line">
            <label>
              Miqdar{' '}
              <input
                aria-label="Miqdar"
                type="number"
                min={p.minOrder}
                max={p.stock}
                step="1"
                value={qty}
                onChange={(e) => {
                  setAdded(false);
                  setQty(Number(e.target.value));
                }}
              />
            </label>
            <span>
              {p.stock} {p.unit} stokda · min. {p.minOrder}
            </span>
          </div>
          {!valid && (
            <p className="v-error">
              Miqdar {p.minOrder}–{p.stock} aralığında tam ədəd olmalıdır.
            </p>
          )}
          <div className="v-detail-actions">
            <button
              className="v-btn"
              disabled={!valid || (!!user && user.role !== 'buyer')}
              onClick={add}
            >
              {added ? <Check size={18} /> : <ShoppingCart size={18} />}
              {added ? 'Səbətə əlavə edildi' : 'Səbətə əlavə et'}
            </button>
            <button
              className="v-btn v-btn-outline"
              disabled={!valid || (!!user && user.role !== 'buyer')}
              onClick={() => {
                add();
                navigate('/cart');
              }}
            >
              İndi al
            </button>
          </div>
          {user && user.role !== 'buyer' && (
            <p className="v-muted">Alış-veriş üçün alıcı hesabına daxil olun.</p>
          )}
          <div className="v-seller-mini">
            <Store size={24} />
            <div>
              <Link to={'/store/' + seller.id}>
                <b>{seller.name}</b> <ArrowUpRight size={14} />
              </Link>
              <small>
                {seller.city} · {seller.verified ? 'Təsdiqlənmiş satıcı' : 'Yeni satıcı'}
              </small>
            </div>
          </div>
        </div>
      </div>
      <section className="v-specs">
        <h2>Məhsul haqqında</h2>
        {p.specs.map(([key, value], i) => (
          <div key={i}>
            <span>{key}</span>
            <b>{value}</b>
          </div>
        ))}
        <small>Demo kataloqda kateqoriya üzrə nümunə şəkillər istifadə olunur.</small>
      </section>
    </>
  );
}
function PublicStore() {
  const { id } = useParams();
  const state = useStore();
  const seller = state.sellers.find((s) => s.id === id);
  if (!seller) return <Empty text="Mağaza tapılmadı." />;
  return (
    <>
      <section className="v-store-profile">
        <span className="v-store-logo">
          <Store size={38} />
        </span>
        <div>
          <p className="v-eyebrow">{seller.market}</p>
          <h1>{seller.name}</h1>
          <p>{seller.about}</p>
          <span>
            {seller.city} · {seller.phone} · {seller.verified ? 'Təsdiqlənib' : 'Yeni satıcı'}
          </span>
        </div>
      </section>
      <Title eyebrow="MAĞAZANIN KATALOQU" title="Məhsullar" />
      <div className="v-product-grid">
        {state.products
          .filter((p) => p.sellerId === id && p.published)
          .map((p) => (
            <ProductCard p={p} key={p.id} />
          ))}
      </div>
    </>
  );
}
function AuthPage({ signup = false }: { signup?: boolean }) {
  const auth = useAuth();
  const user = useCurrentUser();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [role, setRole] = useState<'buyer' | 'seller'>(
    params.get('role') === 'seller' ? 'seller' : 'buyer',
  );
  const [name, setName] = useState('');
  const [shop, setShop] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let active = true;
    demoReady
      .then(() => {
        if (active) setReady(true);
      })
      .catch(() => {
        if (active) setError('Demo hesabları hazırlamaq mümkün olmadı. localhost istifadə edin.');
      });
    return () => {
      active = false;
    };
  }, []);
  if (user) return <Navigate to={roleHome(user.role)} replace />;
  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (signup) {
        if (password !== confirm) throw new Error('Şifrələr eyni deyil.');
        if (role === 'seller' && !shop.trim()) throw new Error('Mağaza adını daxil edin.');
        const sellerId = role === 'seller' ? crypto.randomUUID() : undefined;
        await auth.signup(name, email, password, role, sellerId);
        if (sellerId) {
          const seller: Seller = {
            id: sellerId,
            name: shop.trim(),
            owner: name.trim(),
            market: 'Onlayn mağaza',
            address: '',
            city: 'Bakı',
            phone: '',
            since: new Date().getFullYear(),
            rating: 0,
            reviewCount: 0,
            followers: 0,
            responseTime: 'Yeni mağaza',
            verified: false,
            about: '',
            freeShippingFrom: 50,
            shippingFee: 4,
            createdAt: Date.now(),
          };
          useStore.setState((s) => ({ sellers: [...s.sellers, seller] }));
        }
      } else await auth.login(email, password);
      navigate(roleHome(currentUser()?.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Əməliyyat alınmadı.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="v-app v-auth-page">
      <div className="v-auth-story">
        <Brand full />
        <div>
          <span className="v-hero-badge">YERLİ BİZNESİN YENİ ÜNVANI</span>
          <h1>
            Bir hesab.
            <br />
            Daha çox imkan.
          </h1>
          <p>Alış-verişdən mağaza idarəetməsinə — hər şey Vendora-da.</p>
          <div className="v-auth-feature">
            <ShoppingBag />
            Alıcılar üçün rahat alış-veriş
          </div>
          <div className="v-auth-feature">
            <Store />
            Satıcılar üçün vahid idarəetmə
          </div>
          <div className="v-auth-feature">
            <ShieldCheck />
            Admin üçün platforma nəzarəti
          </div>
        </div>
        <small>Azərbaycan biznesi üçün hazırlanıb.</small>
      </div>
      <div className="v-auth-form-wrap">
        <Link className="v-back" to="/">
          ← Marketplace-ə qayıt
        </Link>
        <form className="v-auth-form" onSubmit={submit}>
          <p className="v-eyebrow">VENDORA HESABI</p>
          <h1>{signup ? 'Xoş gəldiniz.' : 'Yenidən salam.'}</h1>
          <p>
            {signup
              ? 'Hesab yaradın və ilk addımı atın.'
              : 'Davam etmək üçün hesabınıza daxil olun.'}
          </p>
          {signup && (
            <>
              <div className="v-role-choice">
                <button
                  type="button"
                  className={role === 'buyer' ? 'active' : ''}
                  onClick={() => setRole('buyer')}
                >
                  <ShoppingBag size={20} />
                  Alıcıyam
                </button>
                <button
                  type="button"
                  className={role === 'seller' ? 'active' : ''}
                  onClick={() => setRole('seller')}
                >
                  <Store size={20} />
                  Satıcıyam
                </button>
              </div>
              <label>
                Ad və soyad
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  placeholder="Adınız və soyadınız"
                />
              </label>
              {role === 'seller' && (
                <label>
                  Mağazanın adı
                  <input
                    required
                    value={shop}
                    onChange={(e) => setShop(e.target.value)}
                    placeholder="Mağazanızın adı"
                  />
                </label>
              )}
            </>
          )}
          <label>
            E-poçt
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="siz@example.az"
            />
          </label>
          <label>
            Şifrə
            <input
              required
              type="password"
              minLength={signup ? 8 : undefined}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={signup ? 'new-password' : 'current-password'}
              placeholder={signup ? 'Ən azı 8 simvol' : 'Şifrəniz'}
            />
          </label>
          {signup && (
            <label>
              Şifrəni təkrarlayın
              <input
                required
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
              />
            </label>
          )}
          {error && (
            <div className="v-error" role="alert">
              {error}
            </div>
          )}
          <button className="v-btn" disabled={busy || !ready}>
            {busy ? 'Gözləyin...' : signup ? 'Hesab yarat' : 'Daxil ol'}
            <ArrowRight size={18} />
          </button>
          <p className="v-auth-switch">
            {signup ? 'Artıq hesabınız var?' : 'Hesabınız yoxdur?'}{' '}
            <Link to={signup ? '/login' : '/signup'}>
              {signup ? 'Daxil olun' : 'Qeydiyyatdan keçin'}
            </Link>
          </p>
          {!signup && (
            <div className="v-demo-box">
              <b>Demo hesabları</b>
              <p>
                Şifrə: <code>Vendora123!</code>
              </p>
              <div>
                {(['buyer', 'seller', 'admin'] as const).map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => {
                      setEmail(r + '@vendora.az');
                      setPassword('Vendora123!');
                    }}
                  >
                    {roles[r]}
                  </button>
                ))}
              </div>
              <small>Demo giriş yalnız bu brauzerdə işləyir. Admin qeydiyyatı açıq deyil.</small>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
function Stats({ items }: { items: { label: string; value: string; note: string }[] }) {
  return (
    <div className="v-stats">
      {items.map((item, i) => (
        <div className="v-stat" key={item.label}>
          <span>
            {item.label}
            <span className="v-stat-icon">
              {i === 0 ? (
                <ShoppingBag size={18} />
              ) : i === 1 ? (
                <Package size={18} />
              ) : i === 2 ? (
                <Store size={18} />
              ) : (
                <Users size={18} />
              )}
            </span>
          </span>
          <strong>{item.value}</strong>
          <small>{item.note}</small>
        </div>
      ))}
    </div>
  );
}
function Dashboard({ admin = false }: { admin?: boolean }) {
  const state = useStore();
  const user = useCurrentUser();
  const products = state.products.filter((p) => admin || p.sellerId === user?.sellerId);
  const orders = state.orders.filter((o) => admin || o.sellerId === user?.sellerId);
  const completed = orders.filter((o) => o.status !== 'Ləğv edildi');
  const sales = completed.reduce((a, o) => a + o.total, 0);
  const low = products.filter((p) => p.stock <= p.minStock);
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - 6 + i);
    return {
      label: date.toLocaleDateString('az-AZ', { weekday: 'short' }),
      value: completed
        .filter((o) => new Date(o.createdAt).toDateString() === date.toDateString())
        .reduce((a, o) => a + o.total, 0),
    };
  });
  const max = Math.max(...days.map((d) => d.value), 1);
  return (
    <>
      <Title
        eyebrow={admin ? 'PLATFORMAYA ÜMUMİ BAXIŞ' : 'BİZNESİNİZƏ ÜMUMİ BAXIŞ'}
        title={
          admin ? 'İdarəetmə paneli' : 'Salam, ' + (user?.name.split(' ')[0] || 'satıcı') + '.'
        }
      >
        <Link to={admin ? '/admin/products' : '/seller/products'} className="v-btn">
          <Plus size={17} />
          Məhsullar
        </Link>
      </Title>
      <Stats
        items={[
          {
            label: 'Ümumi satış',
            value: formatAZN(sales),
            note: 'Ləğv edilmiş sifarişlər çıxılıb',
          },
          {
            label: 'Sifarişlər',
            value: String(orders.length),
            note: orders.filter((o) => o.status === 'Yeni').length + ' yeni sifariş',
          },
          {
            label: admin ? 'Satıcılar' : 'Məhsullar',
            value: String(admin ? state.sellers.length : products.length),
            note: products.filter((p) => p.published).length + ' aktiv məhsul',
          },
          {
            label: 'Stok dəyəri',
            value: formatAZN(products.reduce((a, p) => a + p.stock * p.cost, 0)),
            note: low.length + ' məhsulun stoku azdır',
          },
        ]}
      />
      <div className="v-dashboard-grid">
        <section className="v-panel">
          <div className="v-panel-heading">
            <div>
              <h2>Satış dinamikası</h2>
              <p>Son 7 gün · AZN</p>
            </div>
            <span className="v-pill">Bu həftə</span>
          </div>
          <div className="v-chart">
            {days.map((d, i) => (
              <div key={i}>
                <span>{formatAZN(d.value)}</span>
                <div className="v-chart-track">
                  <div style={{ height: Math.max(2, (d.value / max) * 100) + '%' }} />
                </div>
                <small>{d.label}</small>
              </div>
            ))}
          </div>
        </section>
        <section className="v-panel">
          <div className="v-panel-heading">
            <h2>Stok nəzarəti</h2>
            <span className="v-pill">{low.length}</span>
          </div>
          {low.slice(0, 5).map((p) => (
            <div className="v-low-stock" key={p.id}>
              <Photo product={p} />
              <div>
                <b>{p.name}</b>
                <small>
                  Minimum: {p.minStock} {p.unit}
                </small>
              </div>
              <span>{p.stock}</span>
            </div>
          ))}
          {!low.length && <Empty text="Bütün stoklar qaydasındadır." />}
        </section>
      </div>
      <section className="v-panel">
        <div className="v-panel-heading">
          <h2>Son sifarişlər</h2>
          <Link className="v-text-link" to={admin ? '/admin/orders' : '/seller/orders'}>
            Hamısına bax <ArrowRight size={16} />
          </Link>
        </div>
        <OrderTable orders={orders.slice(0, 6)} />
      </section>
    </>
  );
}
function OrderTable({ orders, editable = false }: { orders: Order[]; editable?: boolean }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  function change(order: Order, status: OrderStatus) {
    const state = useStore.getState();
    const live = state.orders.find((o) => o.id === order.id);
    if (
      !live ||
      live.status === status ||
      live.status === 'Ləğv edildi' ||
      live.status === 'Çatdırıldı'
    )
      return;
    if (status !== 'Ləğv edildi' && statuses.indexOf(status) !== statuses.indexOf(live.status) + 1)
      return;
    useStore.setState((s) => ({
      orders: s.orders.map((o) =>
        o.id === live.id
          ? { ...o, status, timeline: [...o.timeline, { status, at: Date.now() }] }
          : o,
      ),
      products:
        status === 'Ləğv edildi'
          ? s.products.map((p) => ({
              ...p,
              stock:
                p.stock +
                live.items.filter((i) => i.productId === p.id).reduce((a, i) => a + i.qty, 0),
            }))
          : s.products,
      logs:
        status === 'Ləğv edildi'
          ? [
              ...live.items.map((i) => ({
                id: crypto.randomUUID(),
                productId: i.productId,
                sellerId: live.sellerId,
                type: 'Düzəliş' as const,
                qty: i.qty,
                balance: (s.products.find((p) => p.id === i.productId)?.stock || 0) + i.qty,
                user: currentUser()?.name || '',
                at: Date.now(),
                ref: live.number,
              })),
              ...s.logs,
            ]
          : s.logs,
    }));
  }
  return orders.length ? (
    <div className="v-table-wrap">
      <table className="v-table">
        <thead>
          <tr>
            <th>Sifariş</th>
            <th>Müştəri</th>
            <th>Tarix</th>
            <th>Status</th>
            <th>Məbləğ</th>
            <th>Detallar</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>
                <b>{o.number}</b>
                <small>{o.source}</small>
              </td>
              <td>
                {o.customerName}
                <small>
                  {o.city} · {o.phone}
                </small>
              </td>
              <td>{new Date(o.createdAt).toLocaleDateString('az-AZ')}</td>
              <td>
                {editable ? (
                  <select
                    aria-label={o.number + ' statusu'}
                    value={o.status}
                    disabled={o.status === 'Ləğv edildi' || o.status === 'Çatdırıldı'}
                    onChange={(e) => change(o, e.target.value as OrderStatus)}
                  >
                    {statuses
                      .filter(
                        (s) =>
                          s === o.status ||
                          s === 'Ləğv edildi' ||
                          statuses.indexOf(s) === statuses.indexOf(o.status) + 1,
                      )
                      .map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                  </select>
                ) : (
                  <span
                    className={
                      'v-status ' +
                      (o.status === 'Çatdırıldı'
                        ? 'success'
                        : o.status === 'Ləğv edildi'
                          ? 'cancel'
                          : '')
                    }
                  >
                    {o.status}
                  </span>
                )}
              </td>
              <td>
                <b>{formatAZN(o.total)}</b>
              </td>
              <td>
                <button
                  className="v-icon-btn"
                  aria-label={o.number + ' detalları'}
                  onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                >
                  <ChevronRight size={18} />
                </button>
                {expanded === o.id && (
                  <div className="v-order-detail">
                    <b>{o.number}</b>
                    <p>{o.address}</p>
                    {o.items.map((i) => (
                      <p key={i.productId}>
                        {i.name} × {i.qty} — {formatAZN(i.qty * i.unitPrice)}
                      </p>
                    ))}
                    <p>Çatdırılma: {formatAZN(o.shipping)}</p>
                    <p>
                      {o.payment} · {o.paid ? 'Ödənilib' : 'Ödənilməyib'}
                    </p>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <Empty text="Hələ sifariş yoxdur." />
  );
}
function OrdersPage({ admin = false, buyer = false }: { admin?: boolean; buyer?: boolean }) {
  const state = useStore();
  const user = useCurrentUser();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const orders = state.orders.filter(
    (o) =>
      (admin || (buyer ? o.customerId === user?.id : o.sellerId === user?.sellerId)) &&
      (!status || o.status === status) &&
      (o.number + ' ' + o.customerName).toLocaleLowerCase('az').includes(q.toLocaleLowerCase('az')),
  );
  return (
    <>
      <Title
        eyebrow={buyer ? 'ALICI HESABI' : 'SİFARİŞ İDARƏETMƏSİ'}
        title={buyer ? 'Sifarişlərim' : 'Sifarişlər'}
      />
      <div className="v-catalog-toolbar">
        <div className="v-search">
          <Search size={18} />
          <input
            aria-label="Sifariş axtar"
            placeholder="Sifariş nömrəsi və ya müştəri"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <select
          aria-label="Status filtri"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">Bütün statuslar</option>
          {statuses.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <span>{orders.length} sifariş</span>
      </div>
      <section className="v-panel">
        <OrderTable orders={orders} editable={!buyer} />
      </section>
    </>
  );
}
function ProductsPage({ admin = false }: { admin?: boolean }) {
  const state = useStore();
  const user = useCurrentUser();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('');
  const [editing, setEditing] = useState<Product | 'new' | null>(null);
  const products = state.products.filter(
    (p) =>
      (admin || p.sellerId === user?.sellerId) &&
      (p.name + ' ' + p.sku).toLocaleLowerCase('az').includes(q.toLocaleLowerCase('az')) &&
      (!filter || (filter === 'active' ? p.published : !p.published)),
  );
  return (
    <>
      <Title
        eyebrow={admin ? 'PLATFORMANIN KATALOQU' : 'MAĞAZANIN KATALOQU'}
        title={admin ? 'Bütün məhsullar' : 'Məhsullarım'}
      >
        <button className="v-btn" onClick={() => setEditing('new')}>
          <Plus size={18} />
          Yeni məhsul
        </button>
      </Title>
      <div className="v-catalog-toolbar">
        <div className="v-search">
          <Search size={18} />
          <input
            aria-label="Məhsul axtar"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ad və ya SKU ilə axtar"
          />
        </div>
        <select
          aria-label="Yayım filtri"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">Bütün məhsullar</option>
          <option value="active">Satışda olanlar</option>
          <option value="draft">Qaralamalar</option>
        </select>
        <span>{products.length} məhsul</span>
      </div>
      <section className="v-panel">
        {products.length ? (
          <div className="v-table-wrap">
            <table className="v-table">
              <thead>
                <tr>
                  <th>Məhsul</th>
                  {admin && <th>Satıcı</th>}
                  <th>Qiymət</th>
                  <th>Stok</th>
                  <th>Marketplace</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="v-table-product">
                        <Photo product={p} />
                        <div>
                          <b>{p.name}</b>
                          <small>
                            {p.sku} · {CATEGORIES.find((c) => c.slug === p.category)?.name}
                          </small>
                        </div>
                      </div>
                    </td>
                    {admin && <td>{state.sellers.find((s) => s.id === p.sellerId)?.name}</td>}
                    <td>
                      <b>{formatAZN(p.price)}</b>
                      <small>Alış: {formatAZN(p.cost)}</small>
                    </td>
                    <td>
                      <span className={p.stock <= p.minStock ? 'v-stock-warning' : ''}>
                        {p.stock} {p.unit}
                      </span>
                    </td>
                    <td>
                      <button
                        className={'v-toggle ' + (p.published ? 'on' : '')}
                        aria-label={p.name + ' satış statusu'}
                        aria-pressed={p.published}
                        onClick={() =>
                          useStore.setState((s) => ({
                            products: s.products.map((x) =>
                              x.id === p.id
                                ? { ...x, published: !x.published, publishedAt: Date.now() }
                                : x,
                            ),
                          }))
                        }
                      >
                        <span />
                        {p.published ? 'Aktiv' : 'Qaralama'}
                      </button>
                    </td>
                    <td>
                      <button
                        className="v-icon-btn"
                        aria-label={p.name + ' redaktə et'}
                        onClick={() => setEditing(p)}
                      >
                        <Pencil size={17} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty text="Məhsul yoxdur. İlk məhsulunuzu əlavə edin." />
        )}
      </section>
      {editing && (
        <ProductEditor
          product={editing === 'new' ? undefined : editing}
          admin={admin}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
async function fileImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024)
    throw new Error('5 MB-dan kiçik şəkil seçin.');
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const canvas = document.createElement('canvas');
    const scale = Math.min(1, 900 / Math.max(img.width, img.height));
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Şəkil yüklənmədi.');
    context.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.75);
  } finally {
    URL.revokeObjectURL(url);
  }
}
function ProductEditor({
  product,
  admin,
  onClose,
}: {
  product?: Product;
  admin: boolean;
  onClose: () => void;
}) {
  const user = useCurrentUser();
  const state = useStore();
  const [name, setName] = useState(product?.name || '');
  const [price, setPrice] = useState(String(product?.price || ''));
  const [cost, setCost] = useState(String(product?.cost || ''));
  const [stock, setStock] = useState(String(product?.stock ?? 0));
  const [category, setCategory] = useState<CategorySlug>(product?.category || 'qab-qacaq');
  const [image, setImage] = useState(product?.image || '');
  const [description, setDescription] = useState(product?.description || '');
  const [sellerId, setSellerId] = useState(
    product?.sellerId || user?.sellerId || state.sellers[0]?.id || '',
  );
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [minOrder, setMinOrder] = useState(String(product?.minOrder || 1));
  const [tiers, setTiers] = useState(
    product?.tiers.map((t) => t.min + ':' + t.price).join('\n') || '',
  );
  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [onClose]);
  function save(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      if (
        !name.trim() ||
        !sellerId ||
        !Number.isFinite(+price) ||
        +price <= 0 ||
        !Number.isFinite(+cost) ||
        +cost < 0 ||
        !Number.isInteger(+stock) ||
        +stock < 0 ||
        !Number.isInteger(+minOrder) ||
        +minOrder < 1
      )
        throw new Error('Ad, qiymət və stok məlumatlarını düzgün daxil edin.');
      if (image && !image.startsWith('data:image/jpeg;') && !/^https:\/\//i.test(image))
        throw new Error('Şəkil üçün HTTPS ünvanı daxil edin və ya fayl yükləyin.');
      const parsed = tiers.trim()
        ? tiers
            .trim()
            .split('\n')
            .map((line) => {
              const parts = line.split(':');
              const min = Number(parts[0]);
              const amount = Number(parts[1]);
              if (
                parts.length !== 2 ||
                !Number.isInteger(min) ||
                min < 1 ||
                !Number.isFinite(amount) ||
                amount <= 0
              )
                throw new Error('Topdan qiymətləri miqdar:qiymət formatında daxil edin.');
              return { min, price: amount };
            })
            .sort((a, b) => a.min - b.min)
        : [];
      if (new Set(parsed.map((t) => t.min)).size !== parsed.length)
        throw new Error('Topdan miqdarlar təkrarlanmamalıdır.');
      const p: Product = {
        id: product?.id || crypto.randomUUID(),
        sellerId,
        name: name.trim(),
        sku: product?.sku || 'VD-' + Date.now().toString().slice(-7),
        category,
        art: product?.art || 'box',
        image: image || undefined,
        unit: product?.unit || 'ədəd',
        price: +price,
        cost: +cost,
        tiers: parsed,
        minOrder: +minOrder,
        stock: +stock,
        minStock: product?.minStock || 5,
        published: product?.published ?? false,
        rating: product?.rating || 0,
        reviewCount: product?.reviewCount || 0,
        soldCount: product?.soldCount || 0,
        fastDelivery: product?.fastDelivery ?? true,
        specs: product?.specs || [],
        description,
        createdAt: product?.createdAt || Date.now(),
      };
      useStore.setState((s) => ({
        products: product
          ? s.products.map((x) => (x.id === product.id ? p : x))
          : [p, ...s.products],
      }));
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Yadda saxlamaq alınmadı.');
    }
  }
  return (
    <div
      className="v-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section className="v-modal" role="dialog" aria-modal="true" aria-labelledby="editor-title">
        <header>
          <div>
            <p className="v-eyebrow">MƏHSUL KARTI</p>
            <h2 id="editor-title">{product ? 'Məhsulu redaktə et' : 'Yeni məhsul'}</h2>
          </div>
          <button className="v-icon-btn" aria-label="Bağla" onClick={onClose}>
            <X />
          </button>
        </header>
        <form onSubmit={save}>
          <label>
            Məhsul adı
            <input autoFocus required value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          {admin && (
            <label>
              Satıcı
              <select value={sellerId} onChange={(e) => setSellerId(e.target.value)}>
                {state.sellers.map((s) => (
                  <option value={s.id} key={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <div className="v-form-grid">
            <label>
              Satış qiyməti (₼)
              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </label>
            <label>
              Alış qiyməti (₼)
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
              />
            </label>
            <label>
              Stok
              <input
                required
                type="number"
                min="0"
                step="1"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
            </label>
            <label>
              Minimum sifariş
              <input
                required
                type="number"
                min="1"
                step="1"
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value)}
              />
            </label>
          </div>
          <label>
            Kateqoriya
            <select value={category} onChange={(e) => setCategory(e.target.value as CategorySlug)}>
              {CATEGORIES.map((c) => (
                <option value={c.slug} key={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Məhsul şəkli (HTTPS)
            <input
              value={image.startsWith('data:') ? '' : image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://..."
            />
          </label>
          <div className="v-upload">
            <Photo product={{ name, category, image }} />
            <label className="v-upload-label">
              <ImagePlus size={18} />
              {uploading ? 'Yüklənir...' : 'Şəkil yüklə'}
              <input
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploading(true);
                  try {
                    setImage(await fileImage(file));
                    setError('');
                  } catch (err) {
                    setError(err instanceof Error ? err.message : 'Şəkil alınmadı.');
                  } finally {
                    setUploading(false);
                  }
                }}
              />
            </label>
            <small>JPG / PNG / WEBP · maksimum 5 MB</small>
            <button
              type="button"
              className="v-icon-btn"
              aria-label="Şəkli sil"
              onClick={() => setImage('')}
            >
              <Trash2 size={17} />
            </button>
          </div>
          <label>
            Topdan qiymətlər
            <textarea
              value={tiers}
              onChange={(e) => setTiers(e.target.value)}
              placeholder={'100:0.70\n500:0.65'}
            />
            <small>Hər sətirdə miqdar:qiymət. Boş saxlasanız standart qiymət işləyir.</small>
          </label>
          <label>
            Təsvir
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          {error && (
            <p className="v-error" role="alert">
              {error}
            </p>
          )}
          <footer>
            <button type="button" className="v-btn v-btn-outline" onClick={onClose}>
              Ləğv et
            </button>
            <button className="v-btn" disabled={uploading}>
              Yadda saxla <Check size={16} />
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
function SellersPage() {
  const state = useStore();
  const [q, setQ] = useState('');
  return (
    <>
      <Title eyebrow="SATICI ŞƏBƏKƏSİ" title="Satıcılar" />
      <div className="v-catalog-toolbar">
        <div className="v-search">
          <Search size={18} />
          <input
            aria-label="Satıcı axtar"
            placeholder="Mağaza və ya sahibinin adı"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>
      <section className="v-panel">
        <div className="v-table-wrap">
          <table className="v-table">
            <thead>
              <tr>
                <th>Mağaza</th>
                <th>Sahibi</th>
                <th>Məhsul</th>
                <th>Şəhər</th>
                <th>Təsdiq</th>
              </tr>
            </thead>
            <tbody>
              {state.sellers
                .filter((s) =>
                  (s.name + ' ' + s.owner)
                    .toLocaleLowerCase('az')
                    .includes(q.toLocaleLowerCase('az')),
                )
                .map((s) => (
                  <tr key={s.id}>
                    <td>
                      <Link to={'/store/' + s.id}>
                        <b>{s.name}</b>
                      </Link>
                      <small>{s.market}</small>
                    </td>
                    <td>{s.owner}</td>
                    <td>{state.products.filter((p) => p.sellerId === s.id).length}</td>
                    <td>{s.city}</td>
                    <td>
                      <button
                        className={'v-toggle ' + (s.verified ? 'on' : '')}
                        aria-pressed={s.verified}
                        onClick={() =>
                          useStore.setState((state) => ({
                            sellers: state.sellers.map((x) =>
                              x.id === s.id ? { ...x, verified: !x.verified } : x,
                            ),
                          }))
                        }
                      >
                        <span />
                        {s.verified ? 'Təsdiqlənib' : 'Təsdiqlə'}
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
function UsersPage() {
  const accounts = useAuth((s) => s.accounts);
  const [q, setQ] = useState('');
  return (
    <>
      <Title eyebrow="HESABLARA NƏZARƏT" title="İstifadəçilər" />
      <div className="v-catalog-toolbar">
        <div className="v-search">
          <Search size={18} />
          <input
            aria-label="İstifadəçi axtar"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ad və ya e-poçt"
          />
        </div>
      </div>
      <section className="v-panel">
        <div className="v-table-wrap">
          <table className="v-table">
            <thead>
              <tr>
                <th>İstifadəçi</th>
                <th>E-poçt</th>
                <th>Rol</th>
              </tr>
            </thead>
            <tbody>
              {accounts
                .filter((a) =>
                  (a.name + ' ' + a.email)
                    .toLocaleLowerCase('az')
                    .includes(q.toLocaleLowerCase('az')),
                )
                .map((a) => (
                  <tr key={a.id}>
                    <td>
                      <div className="v-account">
                        <span className="v-avatar">{a.name[0]}</span>
                        <b>{a.name}</b>
                      </div>
                    </td>
                    <td>{a.email}</td>
                    <td>
                      <span className="v-pill">{roles[a.role]}</span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
function SellerProfile() {
  const user = useCurrentUser();
  const seller = useStore((s) => s.sellers.find((x) => x.id === user?.sellerId));
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState(seller?.name || '');
  const [phone, setPhone] = useState(seller?.phone || '');
  const [city, setCity] = useState(seller?.city || 'Bakı');
  const [address, setAddress] = useState(seller?.address || '');
  const [about, setAbout] = useState(seller?.about || '');
  return (
    <>
      <Title eyebrow="MAĞAZA PROFİLİ" title="Mağazam">
        {seller && (
          <Link className="v-btn v-btn-outline" to={'/store/' + seller.id}>
            Mağazaya bax <ArrowUpRight size={17} />
          </Link>
        )}
      </Title>
      <form
        className="v-panel v-profile-form"
        onSubmit={(e) => {
          e.preventDefault();
          useStore.setState((s) => ({
            sellers: s.sellers.map((x) =>
              x.id === seller?.id ? { ...x, name: name.trim(), phone, city, address, about } : x,
            ),
          }));
          setSaved(true);
        }}
        onChange={() => setSaved(false)}
      >
        <label>
          Mağazanın adı
          <input required value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <div className="v-form-grid">
          <label>
            Telefon
            <input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>
          <label>
            Şəhər
            <input required value={city} onChange={(e) => setCity(e.target.value)} />
          </label>
        </div>
        <label>
          Ünvan
          <input value={address} onChange={(e) => setAddress(e.target.value)} />
        </label>
        <label>
          Haqqında
          <textarea value={about} onChange={(e) => setAbout(e.target.value)} />
        </label>
        <button className="v-btn">
          Yadda saxla <Check size={17} />
        </button>
        {saved && (
          <p className="v-success" role="status">
            Mağaza məlumatları yeniləndi.
          </p>
        )}
      </form>
    </>
  );
}
function BuyerShell() {
  const user = useCurrentUser();
  return (
    <>
      <Title eyebrow="ŞƏXSİ HESABINIZ" title={'Salam, ' + user?.name.split(' ')[0] + '.'}>
        <Link className="v-btn v-btn-outline" to="/search">
          Alış-verişə davam et <ArrowRight size={17} />
        </Link>
      </Title>
      <nav className="v-buyer-tabs">
        <NavLink end to="/buyer">
          Hesabım
        </NavLink>
        <NavLink to="/buyer/orders">Sifarişlərim</NavLink>
        <Link to="/cart">Səbətim</Link>
      </nav>
      <Outlet />
    </>
  );
}
function BuyerHome() {
  const user = useCurrentUser();
  const orders = useStore((s) => s.orders.filter((o) => o.customerId === user?.id));
  return (
    <>
      <Stats
        items={[
          { label: 'Sifarişlərim', value: String(orders.length), note: 'Bütün sifarişlər' },
          {
            label: 'Aktiv sifarişlər',
            value: String(
              orders.filter((o) => o.status !== 'Çatdırıldı' && o.status !== 'Ləğv edildi').length,
            ),
            note: 'Hazırlanır və ya yoldadır',
          },
          {
            label: 'Ümumi alış',
            value: formatAZN(
              orders.filter((o) => o.status !== 'Ləğv edildi').reduce((a, o) => a + o.total, 0),
            ),
            note: 'Ləğv edilən sifarişlər çıxılıb',
          },
        ]}
      />
      <section className="v-panel v-profile-summary">
        <span className="v-avatar">{user?.name[0]}</span>
        <div>
          <h2>{user?.name}</h2>
          <p>{user?.email}</p>
          <span className="v-pill">Alıcı hesabı</span>
        </div>
      </section>
      <section className="v-panel">
        <div className="v-panel-heading">
          <h2>Son sifarişlərim</h2>
          <Link className="v-text-link" to="/buyer/orders">
            Hamısına bax
          </Link>
        </div>
        <OrderTable orders={orders.slice(0, 5)} />
      </section>
    </>
  );
}
function CartPage({ checkout = false }: { checkout?: boolean }) {
  const user = useCurrentUser();
  const owner = user?.id || 'guest';
  const cart = useCart();
  const state = useStore();
  const navigate = useNavigate();
  const entries = Object.entries(cart.carts[owner] || {});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Bakı');
  const [address, setAddress] = useState('');
  const [delivery, setDelivery] = useState<'Kuryer' | 'Özün götür'>('Kuryer');
  const lines = entries.map(([id, qty]) => ({
    id,
    qty,
    p: state.products.find((p) => p.id === id),
  }));
  const groups = new Map<string, { subtotal: number; shipping: number }>();
  for (const { p, qty } of lines)
    if (p) {
      const g = groups.get(p.sellerId) || { subtotal: 0, shipping: 0 };
      g.subtotal += unitPriceFor(p, qty) * qty;
      groups.set(p.sellerId, g);
    }
  for (const [id, g] of groups) {
    const seller = state.sellers.find((s) => s.id === id);
    g.shipping = delivery === 'Özün götür' ? 0 : seller ? shippingFor(seller, g.subtotal) : 0;
  }
  const subtotal = [...groups.values()].reduce((a, g) => a + g.subtotal, 0);
  const shipping = [...groups.values()].reduce((a, g) => a + g.shipping, 0);
  const invalid = lines.some(
    ({ p, qty }) =>
      !p || !p.published || qty < p.minOrder || qty > p.stock || !Number.isInteger(qty),
  );
  function confirm(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError('');
    setBusy(true);
    try {
      if (!user || user.role !== 'buyer') throw new Error('Alıcı hesabına daxil olun.');
      if (!/^\+?[\d\s()-]{9,20}$/.test(phone))
        throw new Error('Düzgün telefon nömrəsi daxil edin.');
      const latest = useStore.getState();
      const fresh = Object.entries(useCart.getState().carts[owner] || {});
      if (!fresh.length) throw new Error('Səbətiniz boşdur.');
      const bySeller = new Map<string, { p: Product; qty: number }[]>();
      for (const [id, qty] of fresh) {
        const p = latest.products.find((x) => x.id === id);
        if (!p || !p.published || !Number.isInteger(qty) || qty < p.minOrder || qty > p.stock)
          throw new Error('Məhsulun stoku və ya satış statusu dəyişib. Səbətinizi yeniləyin.');
        const group = bySeller.get(p.sellerId) || [];
        group.push({ p, qty });
        bySeller.set(p.sellerId, group);
      }
      const checkoutId = crypto.randomUUID();
      const now = Date.now();
      const newOrders: Order[] = [];
      for (const [sellerId, items] of bySeller) {
        const seller = latest.sellers.find((s) => s.id === sellerId);
        if (!seller) throw new Error('Satıcı tapılmadı.');
        const sub = items.reduce((a, i) => a + unitPriceFor(i.p, i.qty) * i.qty, 0);
        const fee = delivery === 'Özün götür' ? 0 : shippingFor(seller, sub);
        newOrders.push({
          id: crypto.randomUUID(),
          number: 'VD-' + now.toString().slice(-7) + '-' + (newOrders.length + 1),
          checkoutId,
          sellerId,
          source: 'Marketplace',
          status: 'Yeni',
          customerId: user.id,
          customerName: name.trim(),
          phone,
          city,
          address: delivery === 'Özün götür' ? seller.address : address,
          delivery,
          payment: 'Nağd',
          paid: false,
          items: items.map(({ p, qty }) => ({
            productId: p.id,
            name: p.name,
            sku: p.sku,
            qty,
            unitPrice: unitPriceFor(p, qty),
            unitCost: p.cost,
          })),
          subtotal: sub,
          shipping: fee,
          total: sub + fee,
          createdAt: now,
          timeline: [{ status: 'Yeni', at: now }],
        });
      }
      useStore.setState((s) => ({
        orders: [...newOrders, ...s.orders],
        products: s.products.map((p) => {
          const qty = fresh.find(([id]) => id === p.id)?.[1] || 0;
          return qty ? { ...p, stock: p.stock - qty, soldCount: p.soldCount + qty } : p;
        }),
        logs: [
          ...newOrders.flatMap((o) =>
            o.items.map((i) => ({
              id: crypto.randomUUID(),
              productId: i.productId,
              sellerId: o.sellerId,
              type: 'Satış — Marketplace' as const,
              qty: -i.qty,
              balance: (s.products.find((p) => p.id === i.productId)?.stock || 0) - i.qty,
              user: user.name,
              at: now,
              ref: o.number,
            })),
          ),
          ...s.logs,
        ],
      }));
      cart.clear(owner);
      navigate('/buyer/orders?success=1');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sifariş alınmadı.');
    } finally {
      setBusy(false);
    }
  }
  if (checkout && (!user || user.role !== 'buyer'))
    return <Navigate to={user ? roleHome(user.role) : '/login'} replace />;
  return (
    <>
      <Title eyebrow="ALIŞ-VERİŞ" title={checkout ? 'Sifarişi tamamla' : 'Səbətim'} />
      <p className="v-muted">Demo sifariş · nağd ödəniş · kartdan pul tutulmur.</p>
      {!entries.length ? (
        <Empty text="Səbətiniz boşdur.">
          <Link className="v-btn" to="/search">
            Məhsulları kəşf et <ArrowRight size={16} />
          </Link>
        </Empty>
      ) : (
        <div className="v-cart-layout">
          <section className="v-panel">
            {lines.map(({ id, p, qty }) => (
              <div className="v-cart-row" key={id}>
                {p && <Photo product={p} />}
                <div>
                  <b>{p?.name || 'Məhsul artıq mövcud deyil'}</b>
                  <small>{p ? formatAZN(unitPriceFor(p, qty)) + ' / ' + p.unit : ''}</small>
                  {(!p || !p.published || qty > p.stock || qty < p.minOrder) && (
                    <span className="v-error">Məhsul və ya miqdar hazırda uyğun deyil.</span>
                  )}
                </div>
                <input
                  aria-label={(p?.name || id) + ' miqdarı'}
                  type="number"
                  min={p?.minOrder || 1}
                  max={p?.stock}
                  step="1"
                  value={qty}
                  onChange={(e) => cart.setQty(owner, id, Math.max(0, Number(e.target.value)))}
                />
                <strong>{p ? formatAZN(unitPriceFor(p, qty) * qty) : '—'}</strong>
                <button
                  className="v-icon-btn"
                  aria-label="Səbətdən sil"
                  onClick={() => cart.setQty(owner, id, 0)}
                >
                  <Trash2 size={17} />
                </button>
              </div>
            ))}
          </section>
          <section className="v-panel v-cart-summary">
            <h2>Sifariş xülasəsi</h2>
            <div>
              <span>Məhsullar</span>
              <b>{formatAZN(subtotal)}</b>
            </div>
            <div>
              <span>Çatdırılma</span>
              <b>{formatAZN(shipping)}</b>
            </div>
            <div className="v-summary-total">
              <span>Cəmi</span>
              <b>{formatAZN(subtotal + shipping)}</b>
            </div>
            <small>Çatdırılma hər mağaza üçün ayrıca hesablanır.</small>
            {!checkout && (
              <>
                <button
                  className="v-btn"
                  disabled={invalid || (!!user && user.role !== 'buyer')}
                  onClick={() => navigate(user ? '/checkout' : '/login')}
                >
                  Sifarişi tamamla <ArrowRight size={17} />
                </button>
                {!user && (
                  <p className="v-muted">
                    Sifariş üçün alıcı hesabına daxil olun. Səbətiniz saxlanacaq.
                  </p>
                )}
                {user && user.role !== 'buyer' && (
                  <p className="v-error">Alış üçün alıcı hesabı istifadə edin.</p>
                )}
              </>
            )}
          </section>
          {checkout && (
            <form className="v-panel v-checkout-form" onSubmit={confirm}>
              <h2>Çatdırılma məlumatları</h2>
              <label>
                Ad və soyad
                <input required value={name} onChange={(e) => setName(e.target.value)} />
              </label>
              <div className="v-form-grid">
                <label>
                  Telefon
                  <input
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+994 50 123 45 67"
                  />
                </label>
                <label>
                  Şəhər
                  <input required value={city} onChange={(e) => setCity(e.target.value)} />
                </label>
              </div>
              <label>
                Çatdırılma
                <select
                  value={delivery}
                  onChange={(e) => setDelivery(e.target.value as 'Kuryer' | 'Özün götür')}
                >
                  <option>Kuryer</option>
                  <option>Özün götür</option>
                </select>
              </label>
              {delivery === 'Kuryer' && (
                <label>
                  Ünvan
                  <textarea required value={address} onChange={(e) => setAddress(e.target.value)} />
                </label>
              )}
              {error && (
                <p className="v-error" role="alert">
                  {error}
                </p>
              )}
              <button className="v-btn" disabled={invalid || busy}>
                Sifarişi təsdiqlə · {formatAZN(subtotal + shipping)} <Check size={17} />
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
}
function SuccessOrders() {
  const [params] = useSearchParams();
  return (
    <>
      {params.get('success') && (
        <div className="v-success" role="status">
          <Check size={18} />
          Sifarişiniz qəbul edildi. Satıcı onu hazırlamağa başlayacaq.
        </div>
      )}
      <OrdersPage buyer />
    </>
  );
}
export default function VendoraApp() {
  const user = useCurrentUser();
  useEffect(() => {
    if (!user || user.role !== 'buyer') return;
    const cart = useCart.getState();
    const guest = cart.carts.guest || {};
    if (!Object.keys(guest).length) return;
    const owned = { ...(cart.carts[user.id] || {}) };
    const products = useStore.getState().products;
    for (const [id, qty] of Object.entries(guest)) {
      const p = products.find((p) => p.id === id);
      if (p && p.stock > 0) owned[id] = Math.min(p.stock, (owned[id] || 0) + qty);
    }
    useCart.setState((s) => ({ carts: { ...s.carts, [user.id]: owned, guest: {} } }));
  }, [user]);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/signup" element={<AuthPage key="signup" signup />} />
        <Route element={<MarketShell />}>
          <Route index element={<MarketHome />} />
          <Route path="search" element={<Catalog />} />
          <Route path="c/:slug" element={<Catalog />} />
          <Route path="p/:id" element={<ProductDetail />} />
          <Route path="store/:id" element={<PublicStore />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CartPage key="checkout" checkout />} />
          <Route element={<Guard role="buyer" />}>
            <Route path="buyer" element={<BuyerShell />}>
              <Route index element={<BuyerHome />} />
              <Route path="orders" element={<SuccessOrders />} />
            </Route>
          </Route>
        </Route>
        <Route element={<Guard role="admin" />}>
          <Route path="admin" element={<WorkspaceShell role="admin" />}>
            <Route index element={<Dashboard admin />} />
            <Route path="products" element={<ProductsPage admin />} />
            <Route path="orders" element={<OrdersPage admin />} />
            <Route path="sellers" element={<SellersPage />} />
            <Route path="users" element={<UsersPage />} />
          </Route>
        </Route>
        <Route element={<Guard role="seller" />}>
          <Route path="seller" element={<WorkspaceShell role="seller" />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="profile" element={<SellerProfile />} />
          </Route>
        </Route>
        <Route path="erp/*" element={<Navigate to="/seller" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
