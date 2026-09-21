import { useEffect, useState, useCallback, useMemo } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Heart,
  IndianRupee,
  LockKeyhole,
  Package,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Tag,
  Truck,
  X,
} from "lucide-react";
import Navbar from "../../components/Navbar.jsx";
import api from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useCart } from "../../context/CartContext.jsx";

const STORE_HERO_IMAGE =
  "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1800&q=85";

const WELLNESS_IMAGE =
  "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=85";

const DEFAULT_MEDICINE_IMAGE =
  "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=700&q=80";

function MedicineCard({ med, saved, adding, onToggleWishlist, onAdd }) {
  const hasDiscount = med.mrp > med.sellingPrice;

  return (
    <article
      className={[
        "store-product-card group relative overflow-hidden rounded-[1.8rem] border",
        "border-white/80 bg-white/70 p-4 shadow-[0_18px_55px_rgba(15,23,42,.06)]",
        "backdrop-blur-xl transition-all duration-500",
        saved
          ? "border-primary/15 shadow-[0_20px_60px_rgba(15,110,91,.09)]"
          : "",
        "hover:-translate-y-1 hover:bg-white hover:shadow-[0_28px_70px_rgba(15,110,91,.11)]",
      ].join(" ")}
    >
      <span className="store-product-corner store-product-corner-top" />
      <span className="store-product-corner store-product-corner-bottom" />

      <div className="relative z-10">
        <div className="relative overflow-hidden rounded-[1.45rem] bg-slate-100">
          <div className="aspect-[1.18/1]">
            <img
              src={med.imageUrl || med.image || DEFAULT_MEDICINE_IMAGE}
              alt=""
              className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
              onError={(event) => {
                event.currentTarget.src = DEFAULT_MEDICINE_IMAGE;
              }}
            />
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent" />

          <span className="absolute left-3 top-3 rounded-full border border-white/30 bg-white/80 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[.12em] text-primary shadow-sm backdrop-blur-md">
            {med.category}
          </span>

          <button
            type="button"
            onClick={() => onToggleWishlist(med)}
            className={[
              "absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full",
              "border border-white/40 bg-white/85 shadow-sm backdrop-blur-md transition-all duration-300",
              "hover:-translate-y-0.5 hover:scale-105",
              saved
                ? "text-accent"
                : "text-slate-400 hover:text-accent",
            ].join(" ")}
            aria-label={
              saved
                ? `Remove ${med.name} from wishlist`
                : `Save ${med.name} to wishlist`
            }
          >
            <Heart size={16} className={saved ? "fill-current" : ""} />
          </button>

          {hasDiscount && (
            <span className="absolute bottom-3 left-3 rounded-full bg-emerald-500 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[.1em] text-white shadow-sm">
              Save ₹{med.mrp - med.sellingPrice}
            </span>
          )}
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[8px] font-bold uppercase tracking-[.13em] text-slate-300">
              KapHealth Store
            </span>

            {med.ratingCount > 0 && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-600">
                <Star size={11} fill="currentColor" />
                {Number(med.ratingAverage || 0).toFixed(1)}
              </span>
            )}
          </div>

          <h3 className="mt-2 line-clamp-2 min-h-[2.7rem] text-sm font-semibold leading-5 text-slate-900 transition group-hover:text-primary">
            {med.name}
          </h3>

          <p className="mt-1.5 line-clamp-2 min-h-[2.5rem] text-[10px] leading-5 text-slate-400">
            {med.description}
          </p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-medium text-slate-500">
              {med.unit}
            </span>

            {med.requiresPrescription ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[9px] font-semibold text-amber-700">
                <ShieldCheck size={10} />
                Prescription
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-semibold text-emerald-700">
                <BadgeCheck size={10} />
                OTC
              </span>
            )}
          </div>

          <div className="mt-4 flex items-end justify-between gap-3 border-t border-slate-100 pt-4">
            <div>
              <p className="flex items-center gap-0.5 font-mono text-xl font-bold text-slate-900">
                <IndianRupee size={14} />
                {med.sellingPrice}
              </p>

              {hasDiscount && (
                <p className="font-mono text-[10px] text-slate-400 line-through">
                  ₹{med.mrp}
                </p>
              )}
            </div>

            <button
              type="button"
              disabled={med.requiresPrescription || adding}
              onClick={() => onAdd(med)}
              className={[
                "store-add-button group/add relative overflow-hidden rounded-full border px-4 py-2.5",
                "text-[10px] font-bold uppercase tracking-[.1em] transition-all duration-300",
                med.requiresPrescription || adding
                  ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                  : "border-primary bg-primary text-white shadow-lg shadow-primary/10 hover:-translate-y-0.5 hover:shadow-xl",
              ].join(" ")}
              title={
                med.requiresPrescription
                  ? "Needs a prescription"
                  : "Add to cart"
              }
            >
              {!med.requiresPrescription && !adding && (
                <span className="store-add-shine" />
              )}

              <span className="relative z-10 flex items-center gap-1.5">
                <ShoppingCart size={13} />
                {adding ? "Adding..." : med.requiresPrescription ? "Rx only" : "Add"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function PromoBanner() {
  return (
    <section className="store-promo group relative overflow-hidden rounded-[2rem] bg-slate-950 shadow-[0_28px_80px_rgba(15,23,42,.14)]">
      <div className="absolute inset-0">
        <img
          src={STORE_HERO_IMAGE}
          alt="Pharmacy products"
          className="h-full w-full object-cover opacity-35 transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/82 to-slate-950/20" />
      </div>

      <div className="relative z-10 flex min-h-[260px] items-center p-7 sm:p-9">
        <div className="max-w-2xl text-white">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-emerald-300/15 bg-emerald-300/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.14em] text-emerald-200">
              KapHealth Pharmacy
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[9px] font-semibold text-white/50">
              <Truck size={11} />
              Home delivery
            </span>
          </div>

          <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
            Everyday healthcare,
            <span className="text-emerald-300"> delivered better.</span>
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-6 text-white/50">
            Vitamins, first aid, personal care and health devices, all in one
            polished pharmacy experience.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-[10px] text-white/45">
            <span className="flex items-center gap-1.5">
              <BadgeCheck size={12} className="text-emerald-300" />
              Verified catalogue
            </span>

            <span className="flex items-center gap-1.5">
              <ShieldCheck size={12} className="text-emerald-300" />
              Secure checkout
            </span>

            <span className="flex items-center gap-1.5">
              <Package size={12} className="text-emerald-300" />
              Track every order
            </span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-5 right-5 hidden w-64 overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/20 shadow-2xl backdrop-blur-md lg:block">
        <div className="aspect-video overflow-hidden">
          <img
            src={STORE_HERO_IMAGE}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex items-center gap-2 p-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
            <Sparkles size={15} />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-white">
              Health, all together
            </p>
            <p className="mt-0.5 text-[9px] text-white/40">
              Pharmacy meets connected care
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Store() {
  const { user } = useAuth();
  const { refreshCart } = useCart();

  const [categories, setCategories] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("popular");
  const [wishlistIds, setWishlistIds] = useState([]);
  const [addingId, setAddingId] = useState(null);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    api
      .get("/store/medicines/categories")
      .then(({ data }) => {
        if (mounted) setCategories(data.categories || []);
      })
      .catch((err) => {
        if (mounted) {
          setError(
            err.response?.data?.message ||
              "Couldn't load store categories."
          );
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (user?.role !== "patient") return;

    let mounted = true;

    api
      .get("/store/wishlist")
      .then(({ data }) => {
        if (mounted) {
          setWishlistIds(
            (data.medicines || []).map((medicine) => medicine._id)
          );
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, [user]);

  const load = useCallback(() => {
    const params = { sort };

    if (search.trim()) params.search = search.trim();
    if (category) params.category = category;

    setLoading(true);
    setError("");

    return api
      .get("/store/medicines", { params })
      .then(({ data }) => {
        setMedicines(data.medicines || []);
        setTotal(data.total || 0);
      })
      .catch((err) => {
        setError(
          err.response?.data?.message ||
            "Couldn't load medicines right now."
        );
        setMedicines([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [search, category, sort]);

  useEffect(() => {
    const timer = setTimeout(() => {
      load().catch(() => {});
    }, 250);

    return () => clearTimeout(timer);
  }, [load]);

  function showToast(message) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  }

  async function addToCart(medicine) {
    if (!user) {
      showToast("Log in to add items to your cart");
      return;
    }

    if (medicine.requiresPrescription) {
      showToast(
        "This item needs a prescription — order it from your consult instead"
      );
      return;
    }

    setAddingId(medicine._id);

    try {
      await api.post("/store/cart/items", {
        medicineId: medicine._id,
        quantity: 1,
      });

      await refreshCart();
      showToast(`Added ${medicine.name} to cart`);
    } catch (err) {
      showToast(
        err.response?.data?.message ||
          "Couldn't add this item to cart"
      );
    } finally {
      setAddingId(null);
    }
  }

  async function toggleWishlist(medicine) {
    if (!user) {
      showToast("Log in to save items");
      return;
    }

    const isSaved = wishlistIds.includes(medicine._id);

    try {
      if (isSaved) {
        await api.delete(`/store/wishlist/${medicine._id}`);
        setWishlistIds((ids) =>
          ids.filter((id) => id !== medicine._id)
        );
        showToast("Removed from wishlist");
      } else {
        await api.post("/store/wishlist", {
          medicineId: medicine._id,
        });
        setWishlistIds((ids) => [...ids, medicine._id]);
        showToast("Saved to wishlist");
      }
    } catch (err) {
      showToast(
        err.response?.data?.message ||
          "Something went wrong"
      );
    }
  }

  const discountedCount = useMemo(
    () =>
      medicines.filter(
        (medicine) => medicine.mrp > medicine.sellingPrice
      ).length,
    [medicines]
  );

  const otcCount = useMemo(
    () =>
      medicines.filter(
        (medicine) => !medicine.requiresPrescription
      ).length,
    [medicines]
  );

  return (
    <div className="store-page relative min-h-screen overflow-hidden bg-[#f4f9f6] pb-10">
      <Navbar />

      <style>{`
        .store-page {
          background:
            radial-gradient(circle at 7% 7%, rgba(15,110,91,.08), transparent 30rem),
            radial-gradient(circle at 93% 24%, rgba(16,185,129,.05), transparent 28rem),
            #f4f9f6;
        }

        .store-page::before {
          content: "";
          position: fixed;
          inset: 0;
          pointer-events: none;
          opacity: .34;
          background-image:
            linear-gradient(rgba(15,110,91,.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15,110,91,.035) 1px, transparent 1px);
          background-size: 50px 50px;
          mask-image: linear-gradient(to bottom, black, transparent 82%);
        }

        /* Uiverse-inspired Add to Cart / product card treatment */
        .store-product-card {
          position: relative;
        }

        .store-product-corner {
          position: absolute;
          width: 18%;
          height: 18%;
          pointer-events: none;
          background: rgba(15,110,91,.045);
          transition: all .5s cubic-bezier(.22,1,.36,1);
        }

        .store-product-corner-top {
          top: 0;
          right: 0;
          border-radius: 0 1.8rem 0 100%;
        }

        .store-product-corner-bottom {
          bottom: 0;
          left: 0;
          border-radius: 0 100% 0 1.8rem;
          background: rgba(15,110,91,.03);
        }

        .store-product-card:hover .store-product-corner {
          width: 100%;
          height: 100%;
          border-radius: 1.8rem;
        }

        .store-add-button {
          isolation: isolate;
        }

        .store-add-shine {
          position: absolute;
          top: -45%;
          left: -35%;
          width: 22%;
          height: 190%;
          transform: rotate(18deg);
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,.25),
            transparent
          );
          transition: left .7s ease;
          pointer-events: none;
        }

        .store-add-button:hover .store-add-shine {
          left: 120%;
        }

        .store-promo::after {
          content: "";
          position: absolute;
          top: -35%;
          left: -30%;
          width: 15%;
          height: 175%;
          transform: rotate(18deg);
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,.16),
            transparent
          );
          animation: store-shine 6s ease-in-out infinite;
          pointer-events: none;
        }

        .store-search {
          position: relative;
        }

        .store-search::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 0;
          height: 2px;
          transform: translateX(-50%);
          border-radius: 99px;
          background: #0f6e5b;
          transition: width .3s ease;
        }

        .store-search:focus-within::after {
          width: calc(100% - 1.5rem);
        }

        @keyframes store-shine {
          0%, 45% { left: -30%; }
          75%, 100% { left: 130%; }
        }

        @media (prefers-reduced-motion: reduce) {
          .store-product-corner,
          .store-add-shine,
          .store-promo::after {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>

      <div className="pointer-events-none absolute -left-56 top-20 h-[34rem] w-[34rem] rounded-full bg-primary/[0.08] blur-3xl" />
      <div className="pointer-events-none absolute -right-48 bottom-0 h-[34rem] w-[34rem] rounded-full bg-accent/[0.05] blur-3xl" />

      <main className="relative mx-auto max-w-7xl px-5 py-7 sm:px-6 lg:px-8 lg:py-10">
        {/* Hero */}
        <section className="rounded-[2rem] border border-white/80 bg-white/65 p-7 shadow-[0_22px_70px_rgba(15,23,42,.07)] backdrop-blur-2xl sm:p-9">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="glass-pill inline-flex items-center gap-1.5">
                  <ShoppingCart size={13} className="text-primary" />
                  KapHealth Store
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.13em] text-emerald-700">
                  <ShieldCheck size={11} />
                  Verified catalogue
                </span>
              </div>

              <p className="eyebrow mt-6">Everyday health essentials</p>

              <h1 className="mt-2 max-w-3xl font-display text-4xl font-semibold leading-[1.05] tracking-tight text-slate-950 sm:text-5xl">
                Shop smarter.
                <span className="block text-primary">
                  Take better care home.
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Explore vitamins, first aid, personal care, devices, and
                everyday wellness essentials. Prescription-only products stay
                linked to your clinical care.
              </p>

              <div className="store-search mt-7 max-w-2xl rounded-[1.25rem] border border-slate-200/80 bg-white/80 p-1.5 shadow-[0_12px_35px_rgba(15,23,42,.05)]">
                <div className="flex items-center">
                  <Search size={17} className="ml-3 shrink-0 text-primary/60" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search vitamins, first aid, devices..."
                    className="h-12 w-full border-0 bg-transparent px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="mr-1 flex h-9 w-9 items-center justify-center rounded-full text-slate-300 transition hover:bg-slate-100 hover:text-slate-700"
                      aria-label="Clear search"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 lg:w-[285px]">
              <StoreMetric icon={<Package size={15} />} value={total} label="Products" />
              <StoreMetric icon={<Tag size={15} />} value={discountedCount} label="Offers" />
              <div className="col-span-2 rounded-2xl border border-slate-200/80 bg-white/60 p-4">
                <div className="flex items-center gap-2 text-slate-400">
                  <BadgeCheck size={15} className="text-primary" />
                  <span className="text-[9px] font-bold uppercase tracking-[.12em]">
                    Prescription-free catalogue
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold text-slate-800">
                  {otcCount} everyday care products
                </p>
              </div>
            </div>
          </div>
        </section>

        <PromoBanner />

        {/* Filters */}
        <section className="mt-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow">Explore catalogue</p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                Find what you need
              </h2>
            </div>

            <div className="relative">
              <select
                className="input h-10 min-w-[190px] bg-white/75 text-xs font-medium"
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                aria-label="Sort products"
              >
                <option value="popular">Most popular</option>
                <option value="rating">Top rated</option>
                <option value="price_low">Price: low to high</option>
                <option value="price_high">Price: high to low</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
            <FilterPill
              active={!category}
              label="All"
              count={categories.reduce((sum, item) => sum + item.count, 0)}
              onClick={() => setCategory("")}
            />

            {categories.map((item) => (
              <FilterPill
                key={item.name}
                active={category === item.name}
                label={item.name}
                count={item.count}
                onClick={() => setCategory(item.name)}
              />
            ))}
          </div>
        </section>

        {error && (
          <div className="mt-4 rounded-2xl border border-red-100 bg-red-50/90 px-4 py-3 text-xs leading-5 text-red-700">
            {error}
          </div>
        )}

        {/* Products */}
        <section className="mt-5">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <div
                  key={item}
                  className="h-[410px] animate-pulse rounded-[1.8rem] border border-slate-200 bg-white/60"
                />
              ))}
            </div>
          ) : medicines.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {medicines.map((medicine) => (
                <MedicineCard
                  key={medicine._id}
                  med={medicine}
                  saved={wishlistIds.includes(medicine._id)}
                  adding={addingId === medicine._id}
                  onToggleWishlist={toggleWishlist}
                  onAdd={addToCart}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/55 p-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Search size={27} />
              </div>

              <p className="eyebrow mt-5">No matches</p>

              <h3 className="mt-1 text-lg font-semibold text-slate-900">
                Nothing matches your search.
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Try another product name, category, or clear the current
                filters.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCategory("");
                }}
                className="btn-secondary mt-5"
              >
                Clear filters
              </button>
            </div>
          )}
        </section>

        {/* Wellness cross-sell */}
        <section className="mt-8 grid gap-4 md:grid-cols-[1.2fr_1fr]">
          <div className="relative overflow-hidden rounded-[2rem] bg-primary p-6 text-white shadow-[0_22px_65px_rgba(15,110,91,.15)] sm:p-7">
            <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />

            <div className="relative z-10 max-w-xl">
              <div className="flex items-center gap-2 text-emerald-200">
                <Sparkles size={15} />
                <span className="text-[9px] font-bold uppercase tracking-[.15em]">
                  Connected care
                </span>
              </div>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                Your pharmacy is part of the bigger picture.
              </h2>

              <p className="mt-2 text-sm leading-6 text-white/55">
                Continue from consultation to prescription to pharmacy without
                losing the care journey.
              </p>

              <div className="mt-5 flex flex-wrap gap-2 text-[9px] font-semibold">
                <span className="rounded-full bg-white/10 px-3 py-1.5">
                  Consultation
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1.5">
                  Prescription
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1.5">
                  Delivery
                </span>
              </div>
            </div>
          </div>

          <div className="group relative min-h-[205px] overflow-hidden rounded-[2rem] shadow-[0_22px_65px_rgba(15,23,42,.10)]">
            <img
              src={WELLNESS_IMAGE}
              alt="Healthy food and wellness"
              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/15 to-transparent" />

            <div className="relative z-10 flex h-full min-h-[205px] flex-col justify-end p-6 text-white">
              <span className="text-[9px] font-bold uppercase tracking-[.15em] text-emerald-200">
                Wellness
              </span>
              <h3 className="mt-1 text-xl font-semibold">
                Shop for today. Build healthier habits for tomorrow.
              </h3>
              <p className="mt-1 text-[10px] text-white/55">
                Explore diet planning and wellness tools.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-7 flex items-center justify-center gap-2 text-[9px] font-semibold uppercase tracking-[.14em] text-slate-400">
          <LockKeyhole size={11} className="text-primary/70" />
          KapHealth Pharmacy · secure shopping
          <Sparkles size={11} className="text-primary/45" />
        </div>
      </main>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-slate-950 px-5 py-3 text-xs font-semibold text-white shadow-2xl backdrop-blur-xl">
          <BadgeCheck size={14} className="text-emerald-300" />
          {toast}
        </div>
      )}
    </div>
  );
}

function FilterPill({ active, label, count, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "shrink-0 rounded-full border px-4 py-2 text-[10px] font-semibold transition-all duration-300",
        active
          ? "border-primary bg-primary text-white shadow-md shadow-primary/15"
          : "border-slate-200 bg-white/70 text-slate-500 hover:-translate-y-0.5 hover:border-primary/20 hover:text-primary",
      ].join(" ")}
    >
      {label}
      {typeof count === "number" && (
        <span className={active ? "ml-1 opacity-70" : "ml-1 opacity-45"}>
          ({count})
        </span>
      )}
    </button>
  );
}

function StoreMetric({ icon, value, label }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/60 p-4">
      <div className="flex items-center gap-2 text-slate-400">
        <span className="text-primary">{icon}</span>
        <span className="text-[9px] font-bold uppercase tracking-[.12em]">
          {label}
        </span>
      </div>

      <p className="mt-2 font-mono text-xl font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}
