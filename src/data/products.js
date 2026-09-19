const images = {
  gpu: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=900&q=85',
  cpu: 'https://images.unsplash.com/photo-1555617981-dac3880eac6e?auto=format&fit=crop&w=900&q=85',
  peripheral: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=85',
  setup: 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&w=900&q=85',
  component: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=900&q=85',
};

const gpuImages = [
  'https://http2.mlstatic.com/D_NQ_NP_2X_661432-MLA99463969542_112025-F.webp',
  'https://http2.mlstatic.com/D_NQ_NP_2X_824697-MLA100004887815_112025-F.webp',
  'https://http2.mlstatic.com/D_Q_NP_926336-MLA115860726070_092026-F.webp',
  'https://http2.mlstatic.com/D_Q_NP_908540-CBT114886472409_072026-F-amd-radeon-rx580-de-51-discos-8-g-2048-sp-blanco-8-gb-g.webp',
  'https://http2.mlstatic.com/D_Q_NP_737158-MLA87181403372_072025-F.webp',
  'https://http2.mlstatic.com/D_Q_NP_985781-MLA105697965491_012026-F.webp',
  'https://http2.mlstatic.com/D_Q_NP_623243-MLA99504494932_112025-F.webp',
  'https://http2.mlstatic.com/D_Q_NP_914653-MLM107977980121_032026-F.webp',
  'https://http2.mlstatic.com/D_Q_NP_723274-CBT110487070927_042026-F.webp',
  'https://http2.mlstatic.com/D_Q_NP_912583-CBT113261643864_072026-F-tarjeta-grafica-asus-prime-radeon-rx-9070-gre-evo-oc.webp',
];

const cpuImages = [
  'https://http2.mlstatic.com/D_Q_NP_990640-MLU79008201219_092024-F.webp',
  'https://http2.mlstatic.com/D_Q_NP_833043-MLA99388467252_112025-F.webp',
  'https://http2.mlstatic.com/D_Q_NP_662234-MLA99574318354_122025-F.webp',
  'https://http2.mlstatic.com/D_Q_NP_895415-MLA99489581824_112025-F.webp',
  'https://http2.mlstatic.com/D_Q_NP_801013-MLA99496628892_112025-F.webp',
  'https://http2.mlstatic.com/D_Q_NP_867967-MLA116488278385_082026-F.webp',
  'https://http2.mlstatic.com/D_Q_NP_713589-MLA79806288755_102024-F.webp',
  'https://http2.mlstatic.com/D_Q_NP_974828-MLM50366192386_062022-F.webp',
  'https://http2.mlstatic.com/D_Q_NP_658785-MLA109744778939_032026-F.webp',
  'https://http2.mlstatic.com/D_Q_NP_691248-MLM100085344121_122025-F.webp',
];

const peripheralImages = [
  'https://http2.mlstatic.com/D_Q_NP_846073-MLA109423011234_042026-L.webp',
  'https://http2.mlstatic.com/D_Q_NP_851731-MLA100096823243_122025-L.webp',
  'https://http2.mlstatic.com/D_Q_NP_736303-MLA91651896832_092025-L.webp',
  'https://http2.mlstatic.com/D_Q_NP_990608-MLA105362286820_012026-L.webp',
  'https://http2.mlstatic.com/D_Q_NP_877833-MLA96239115000_102025-L.webp',
  'https://http2.mlstatic.com/D_Q_NP_805861-MLM116310778246_092026-L.webp',
  'https://http2.mlstatic.com/D_Q_NP_727353-MLA99594140584_122025-L.webp',
  'https://http2.mlstatic.com/D_Q_NP_802407-MLA99452784724_112025-L.webp',
  'https://http2.mlstatic.com/D_Q_NP_835737-MLA107613210086_032026-L.webp',
  'https://http2.mlstatic.com/D_Q_NP_621409-MLA108344614461_032026-L.webp',
];

const setupImages = [
  'https://http2.mlstatic.com/D_Q_NP_921720-MLA112178328562_062026-L.webp',
  'https://http2.mlstatic.com/D_Q_NP_977654-CBT87101875487_072025-L-monitor-gamer-ktc-27-2k-qhd-180hz-va-1500r-curvo-sin-marco.webp',
  'https://http2.mlstatic.com/D_Q_NP_881997-MLA113885262085_062026-L.webp',
  'https://http2.mlstatic.com/D_Q_NP_974112-MLM114796790552_082026-L-mesa-de-centro-escritorio-elevable-electrico-con-ruedas-120.webp',
  'https://http2.mlstatic.com/D_Q_NP_862705-CBT116018806044_092026-L.webp',
  'https://http2.mlstatic.com/D_Q_NP_787904-MLA114385594554_082026-L.webp',
  'https://http2.mlstatic.com/D_Q_NP_747064-CBT53095448674_122022-L-base-soporte-de-audifonos-new-bee-con-luz-led-rgb-usb.webp',
  'https://http2.mlstatic.com/D_Q_NP_731589-MLA99599296420_122025-L.webp',
  'https://http2.mlstatic.com/D_Q_NP_957291-MLA99984626625_112025-L.webp',
  'https://http2.mlstatic.com/D_Q_NP_710809-MLA80741637378_112024-L.webp',
];

const componentImages = [
  'https://http2.mlstatic.com/D_Q_NP_854846-CBT115023206174_082026-L.webp',
  'https://http2.mlstatic.com/D_Q_NP_854028-MLA99980263809_112025-B.webp',
  'https://http2.mlstatic.com/D_Q_NP_935716-MLU78821360088_092024-B.webp',
  'https://http2.mlstatic.com/D_Q_NP_958191-CBT82757161272_032025-B.webp',
  'https://http2.mlstatic.com/D_Q_NP_953452-MLA93300969097_092025-B.webp',
  'https://http2.mlstatic.com/D_Q_NP_875629-MLA84217866904_052025-B.webp',
  'https://http2.mlstatic.com/D_Q_NP_982819-MLA48049378932_102021-B.webp',
  'https://http2.mlstatic.com/D_Q_NP_932868-MLA108808793925_032026-B.webp',
  'https://http2.mlstatic.com/D_Q_NP_896133-MLA99498294367_112025-B.webp',
  'https://http2.mlstatic.com/D_Q_NP_864054-CBT107434477850_032026-B-radiador-pc-ventilador-6-tubos.webp',
];

const categorySeeds = [
  {
    id: 'gpu', label: 'Tarjetas gráficas', icon: 'expansion-card-variant', image: images.gpu,
    names: ['RTX 4070 SUPER', 'RX 7800 XT', 'RTX 4060 Ti', 'RX 7600 XT', 'RTX 4080 SUPER', 'Arc B580', 'RTX 4060', 'RX 7900 GRE', 'RTX 4090', 'RX 7700 XT'],
    prices: [12499, 10499, 7899, 6499, 23999, 5799, 5999, 11999, 32999, 8999],
    specs: ['12 GB GDDR6X', 'DLSS 3.5', 'Ray tracing', 'PCIe 4.0'],
  },
  {
    id: 'cpu', label: 'Procesadores', icon: 'chip', image: images.cpu,
    names: ['Ryzen 7 7800X3D', 'Core i7-14700K', 'Ryzen 5 7600X', 'Core i5-14600KF', 'Ryzen 9 9950X', 'Core i9-14900K', 'Ryzen 7 9700X', 'Core i5-14400F', 'Ryzen 5 9600X', 'Core Ultra 7 265K'],
    prices: [8199, 7499, 4299, 5299, 12499, 10999, 7299, 3499, 4999, 8199],
    specs: ['AM5 / LGA 1700', 'Boost 5.4 GHz', 'Desbloqueado', 'Garantía 3 años'],
  },
  {
    id: 'peripherals', label: 'Periféricos', icon: 'controller-classic-outline', image: images.peripheral,
    names: ['Teclado K70 RGB', 'Auriculares Cloud Alpha', 'Mouse DeathAdder V3', 'Micrófono Seiren V3', 'Teclado Apex Pro TKL', 'Mouse G Pro X Superlight', 'Webcam Facecam MK.2', 'Alfombrilla QcK Heavy', 'Mando Xbox Elite 2', 'Base de carga RGB'],
    prices: [3299, 1999, 2899, 2499, 4499, 3299, 2999, 699, 3799, 1299],
    specs: ['RGB personalizable', 'USB-C', 'Baja latencia', 'Diseño competitivo'],
  },
  {
    id: 'setup', label: 'Setup gamer', icon: 'desk-lamp', image: images.setup,
    names: ['Monitor Odyssey G5 32', 'Monitor LG UltraGear 27', 'Silla Secretlab Titan', 'Escritorio Elevate 140', 'Brazo monitor Flexi', 'Lámpara RGB Flow', 'Soporte auriculares', 'Hub USB-C Pro', 'Panel acústico Hexa', 'Reposapiés Cloud'],
    prices: [8499, 5999, 12999, 7499, 1999, 1499, 899, 1199, 1699, 999],
    specs: ['Envío gratis', 'Montaje sencillo', 'Acabado premium', 'Garantía oficial'],
  },
  {
    id: 'components', label: 'Componentes', icon: 'memory', image: images.component,
    names: ['RAM Fury 32 GB DDR5', 'SSD NVMe 2 TB', 'Fuente 850W Gold', 'Placa B650 WiFi', 'Caja H7 Flow', 'Refrigeración Kraken 240', 'RAM Vengeance 64 GB', 'SSD NVMe 1 TB', 'Fuente 750W Bronze', 'Ventiladores F120 RGB'],
    prices: [2499, 2899, 2999, 3899, 3299, 3499, 4499, 1699, 1899, 1499],
    specs: ['Rendimiento gaming', 'Instalación fácil', 'Eficiencia energética', 'Componentes fiables'],
  },
];

export const categories = [{ id: 'all', label: 'Todo', icon: 'view-grid-outline' }, ...categorySeeds.map(({ id, label, icon }) => ({ id, label, icon }))];

export const products = categorySeeds.flatMap((category) => category.names.map((name, index) => {
  const image = category.id === 'gpu'
    ? gpuImages[index]
    : category.id === 'cpu'
      ? cpuImages[index]
      : category.id === 'peripherals'
        ? peripheralImages[index]
        : category.id === 'setup'
          ? setupImages[index]
          : category.id === 'components'
            ? componentImages[index]
      : `${category.image}&sig=${category.id}-${index}`;
  return {
    id: `${category.id}-${index + 1}`,
    name,
    shortName: name,
    category: category.id,
    categoryLabel: category.label,
    price: category.prices[index],
    currency: 'MXN',
    oldPrice: index % 3 === 0 ? Math.round(category.prices[index] * 1.12) : null,
    rating: (4.6 + ((index + 1) % 4) / 10).toFixed(1),
    image,
    gallery: [image, `${category.image}&sig=${category.id}-${index + 20}`],
    description: `${name} pensado para llevar tu experiencia gaming a otro nivel. Ofrece rendimiento consistente, materiales duraderos y una integración sencilla con tu setup, tanto si estás actualizando una pieza como si estás armando tu equipo desde cero.`,
    specs: category.specs,
    retailerSources: ['DDTech', 'PcComponentes'],
  };
}));

export const offers = products.filter((product) => product.oldPrice).slice(0, 4);
export const latest = products.slice(10, 16);
