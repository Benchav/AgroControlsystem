import { useEffect, useMemo, useState } from "react";
import { PageSection } from "../components/layout/PageSection";
import { mockMarketItems } from "../data/market_data";
import { MarketCategory } from "../entities/market_model";

export function MarketPage() {
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [currentBid, setCurrentBid] = useState(0);
  const [bidAmount, setBidAmount] = useState("");
  const [auctionActive, setAuctionActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [bidHistory, setBidHistory] = useState<string[]>([]);
  const [auctionEnded, setAuctionEnded] = useState(false);
  const minBid = Number((currentBid * 1.05).toFixed(2));
  const maxBid = Number((currentBid * 2).toFixed(2));
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<MarketCategory | "all">("all");
  const [marketItems, setMarketItems] = useState(mockMarketItems);

  const tabs = [
    {
      key: "all" as const,
      label: "Todos",
      icon: "fa-border-all",
      color: "bg-white/20 text-white border-white/20",
    },
    {
      key: "alimentos" as MarketCategory,
      label: "Alimentos",
      icon: "fa-seedling",
      color: "bg-emerald-500/30 text-emerald-300 border-emerald-400/20",
    },
    {
      key: "animales" as MarketCategory,
      label: "Animales",
      icon: "fa-cow",
      color: "bg-amber-500/30 text-amber-300 border-amber-400/20",
    },
    {
      key: "parcelas" as MarketCategory,
      label: "Parcelas",
      icon: "fa-map",
      color: "bg-cyan-500/30 text-cyan-300 border-cyan-400/20",
    },
  ];

  const filteredItems = useMemo(() => {
    return marketItems.filter((item) => {
      // filtro por tab
      const matchesCategory =
        activeTab === "all" || item.category === activeTab;

      // filtro por búsqueda
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase()) ||
        item.status.toLowerCase().includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [activeTab, search, marketItems]);

  const openAuction = (item: any) => {
    setSelectedItem(item);
    setSelectedImage(item.imageUrl[0]);
    setCurrentBid(item.price);

    setBidAmount("");

    setTimeLeft(120);

    setAuctionEnded(false);

    setBidHistory([`Subasta iniciada por $${item.price}`]);

    setAuctionActive(true);
  };

  const handleBid = () => {
    if (auctionEnded) return;

    const value = Number(bidAmount);

    if (!value) return;

    if (value < minBid) {
      alert(`La oferta mínima permitida es $${minBid}`);
      return;
    }

    if (value > maxBid) {
      alert(`La oferta máxima permitida es $${maxBid}`);
      return;
    }

    setCurrentBid(value);

    setMarketItems((prev) =>
      prev.map((item) =>
        item.id === selectedItem.id
          ? {
              ...item,
              price: value,
            }
          : item,
      ),
    );

    setBidHistory((prev) => [`Tú ofertaste $${value}`, ...prev]);

    setBidAmount("");

    // extender tiempo si pujan al final
    if (timeLeft <= 15) {
      setTimeLeft((prev) => prev + 20);
    }
  };

  const closeAuction = () => {
    setAuctionActive(false);

    setSelectedItem(null);

    setBidAmount("");

    setBidHistory([]);

    setAuctionEnded(false);
  };

  //bloquea el scroll del body cuando la subasta está activa
  useEffect(() => {
    if (auctionActive) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [auctionActive]);

  // lógica del temporizador de la subasta, cronometro
  useEffect(() => {
    if (!auctionActive || auctionEnded) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setAuctionEnded(true);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [auctionActive, auctionEnded]);

  //simular otros postores pujando cada cierto tiempo, solo si la subasta está activa y no ha terminado
  useEffect(() => {
    if (!auctionActive || auctionEnded) return;

    const fakeBids = setInterval(() => {
      const randomIncrement = Math.floor(Math.random() * 120) + 20;

      setCurrentBid((prev) => {
        const nextBid = prev + randomIncrement;

        setBidHistory((history) => [
          `AgroUser_${Math.floor(Math.random() * 99)} ofertó $${nextBid}`,
          ...history,
        ]);

        setMarketItems((items) =>
          items.map((item) =>
            item.id === selectedItem.id
              ? {
                  ...item,
                  price: nextBid,
                }
              : item,
          ),
        );

        return nextBid;
      });
    }, 9000);

    return () => clearInterval(fakeBids);
  }, [auctionActive, auctionEnded]);

  const formattedTime = useMemo(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, [timeLeft]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">
        Tierras en alquiler · Cultivos en venta · Subastas activas
      </p>
      <div className="flex flex-row justify-between items-center">
        <div className="relative w-full lg:max-w-md">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />

          <input
            type="text"
            placeholder="Buscar por nombre, categoría o estado..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-emerald-400/30"
          />
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 rounded-2xl border px-5 py-2 text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? `${tab.color} scale-105 shadow-lg`
                    : "border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]"
                }`}
              >
                <i className={`fas ${tab.icon}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5 bg-black/20 backdrop-blur">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="rounded-[14px] border border-white/8 bg-white/[0.03] overflow-hidden"
          >
            <div className="flex h-36 items-center justify-center bg-black/20 text-5xl">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl[0]}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <img
                  src="https://media.istockphoto.com/id/1842732901/es/vector/icono-de-carga.jpg?s=612x612&w=0&k=20&c=t9fex0geQSSL-upo-wtzFNsG48KHFnJFkLQUeMQEh68="
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="flex p-2 flex-col items-start gap-2">
              <div className="mt-3 text-lg font-semibold text-white">
                {item.name}
              </div>
              <span className="text-xs text-slate-500">{item.description}</span>
              <div className="w-full flex flex-row items-center justify-between gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-[10px] font-semibold border ${
                    item.status === "disponible"
                      ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                      : item.status === "pendiente"
                        ? "border-yellow-400/20 bg-yellow-500/10 text-yellow-300"
                        : "border-red-400/20 bg-red-500/10 text-red-300"
                  }`}
                >
                  {item.status}
                </span>
                <div className="mt-1 text-xl font-black tracking-tight text-emerald-300">
                  ${item.price.toFixed(2)}
                </div>
              </div>
              <button
                className=" w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-emerald-500/50 hover:text-white"
                type="button"
                onClick={() => openAuction(item)}
              >
                Ver detalles
              </button>
            </div>
          </div>
        ))}
        {!filteredItems.length && (
          <div className="rounded-[14px] border border-white/8 bg-white/[0.03] p-8 text-center text-slate-400 w-full col-span-full">
            No hay elementos registrados en esta categoría o coincidencia.
          </div>
        )}
      </div>

      {auctionActive && selectedItem && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden bg-black/90 backdrop-blur-md">
          <div
            className="
                relative
                w-[95vw]
                max-w-6xl
                max-h-[90vh]
                overflow-y-auto
                rounded-[28px]
                border
                border-white/10
                bg-[#071510]
                p-6
                shadow-2xl
              "
          >
            {/* HEADER */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-3xl font-black text-white">
                  {selectedItem.name}
                </div>

                <div className="mt-2 text-sm text-slate-400">
                  {selectedItem.description}
                </div>
              </div>

              <button
                onClick={() => {
                  setAuctionActive(false);
                  setSelectedItem(null);
                  closeAuction();
                }}
                className="rounded-xl bg-white/5 px-4 py-2 text-slate-300 hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            {/* CONTENT */}
            <div className="mt-6 grid items-stretch gap-6 xl:grid-cols-[1.2fr_0.8fr_0.5fr]">
              {/* GALERÍA */}
              <div className="flex h-full flex-col gap-4">
                <div className="overflow-hidden rounded-[14px] border border-white/10">
                  <img
                    src={selectedImage}
                    alt={selectedItem.name}
                    className="h-[340px] w-full object-cover"
                  />
                </div>

                {/* mini imágenes */}
                <div className="grid grid-cols-3 gap-3">
                  {selectedItem.imageUrl.map((img: string) => (
                    <button
                      key={img}
                      type="button"
                      onClick={() => setSelectedImage(img)}
                      className={`
                        overflow-hidden
                        rounded-xl
                        border
                        transition
                        ${selectedImage === img ? "border-emerald-400" : "border-white/10"}
                      `}
                    >
                      <img
                        src={img}
                        alt=""
                        className="h-24 w-full object-cover"
                      />
                    </button>
                  ))}
                </div>

                {/* descripción */}
                <div className="rounded-[14px] border border-white/10 bg-white/[0.03] p-5">
                  <div className="text-lg font-semibold text-white">
                    Detalles del producto
                  </div>

                  <div className="mt-3 text-sm leading-relaxed text-slate-400">
                    Este lote se encuentra disponible para subasta en tiempo
                    real. Puedes realizar ofertas competitivas mientras el
                    evento esté activo.
                  </div>
                </div>
              </div>

              {/* SIDEBAR SUBASTA */}
              <div className="flex h-full flex-col gap-4">
                {/* precio actual */}
                <div className="rounded-[14px] border border-emerald-400/20 bg-emerald-500/10 p-6">
                  <div className="text-sm font-semibold text-white">
                    Oferta actual
                  </div>

                  <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/30 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-red-200">
                      Tiempo restante
                    </div>

                    <div className="mt-2 text-4xl font-black text-red-300">
                      {formattedTime}
                    </div>

                    {auctionEnded && (
                      <div className="mt-2 text-sm font-semibold text-white">
                        Subasta finalizada
                      </div>
                    )}
                  </div>

                  <div className="mt-3 text-xs text-emerald-100/70">
                    Oferta mínima permitida: ${minBid.toFixed(2)}
                  </div>

                  <div className="text-xs text-emerald-100/70">
                    Oferta máxima permitida: ${maxBid.toFixed(2)}
                  </div>

                  <div className="mt-2 text-5xl font-black text-emerald-300">
                    ${currentBid.toFixed(2)}
                  </div>
                </div>

                {/* input */}
                <div className="rounded-[14px] border border-white/10 bg-white/[0.03] p-5 h-full ">
                  <div className="text-sm font-semibold text-white">
                    Realizar oferta
                  </div>

                  <div className="mt-4 relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      $
                    </span>

                    <input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder="Ingresa tu oferta"
                      className="w-full rounded-2xl border border-white/10 bg-black/20 py-3 pl-8 pr-4 text-white outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={auctionEnded}
                    />
                  </div>

                  <button
                    onClick={handleBid}
                    className="mt-4 w-full rounded-2xl bg-emerald-500 py-3 font-semibold text-white transition hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={auctionEnded}
                  >
                    Pujar ahora
                  </button>

                  <button
                    onClick={() => {
                      setAuctionActive(false);
                      setSelectedItem(null);
                      closeAuction();
                    }}
                    className="mt-3 w-full rounded-2xl border border-red-400/20 bg-red-500/10 py-3 font-semibold text-red-300 transition hover:bg-red-500/20"
                  >
                    Retirarse de la subasta
                  </button>
                </div>
              </div>
              {/* actividad */}
              <div className="flex max-h-[calc(90vh-20px)] min-h-0 flex-col rounded-[14px] border border-white/10 bg-white/[0.03] p-3 overflow-y-auto">
                <div className="flex flex-col items-start justify-between gap-2">
                  <div className="text-sm font-semibold text-white">
                    Actividad reciente
                  </div>

                  <div className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-300">
                    {bidHistory.length} movimientos
                  </div>
                </div>

                {/* CONTENEDOR CON SCROLL */}
                <div className="mt-4 flex-1 overflow-y-auto pr-1 space-y-2">
                  {bidHistory.map((activity, index) => (
                    <div
                      key={`${activity}-${index}`}
                      className="
                      rounded-xl
                      border
                      border-white/5
                      bg-black/20
                      p-3
                      text-sm
                      text-slate-300
                      animate-[fadeIn_.2s_ease]
                    "
                    >
                      {activity}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
