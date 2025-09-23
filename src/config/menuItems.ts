export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
  hasChildren?: boolean;
  children?: MenuItem[];
}

export const menuItems: MenuItem[] = [
  {
    id: "home",
    label: "HOME",
    icon: "/Home.svg",
    route: "/",
  },
  {
    id: "data-asset",
    label: "DATA ASSET",
    icon: "/dataAsset.svg",
    hasChildren: true,
    children: [
      {
        id: "data-karyawan",
        label: "DATA KARYAWAN",
        icon: "",
        route: "/data-asset/datakaryawan",
      },
      {
        id: "data-asset-main",
        label: "DATA ASSET",
        icon: "",
        route: "/data-asset/dataasset",
      },
      {
        id: "mtu",
        label: "MTU",
        icon: "",
        hasChildren: true,
        children: [
          {
            id: "mtu-1",
            label: "MONITORING KONDISI",
            icon: "",
            route: "/data-asset/mtu/monitoringkondisi",
          },
          {
            id: "mtu-2",
            label: "PENGGANTIAN",
            icon: "",
            route: "/data-asset/mtu/penggantian",
          },
        ],
      },
      {
        id: "tower",
        label: "JARINGAN",
        icon: "",
        hasChildren: true,
        children: [
          {
            id: "tower-1",
            label: "TOWER KRITIS",
            icon: "",
            route: "/data-asset/tower/kritis",
          },
          {
            id: "tower-2",
            label: "ROW KRITIS",
            icon: "",
            route: "/data-asset/tower/rowkritis",
          },
        ],
      },
      {
        id: "sld",
        label: "SLD",
        icon: "",
        route: "/data-asset/sld",
      },
      {
        id: "slo",
        label: "SLO",
        icon: "",
        route: "/data-asset/slo",
      },
    ],
  },
  {
    id: "performance",
    label: "PERFORMANCE",
    icon: "/kinerja.svg",
    route: "/performance",
    hasChildren: true,
    children: [
      {
        id: "performance-1",
        label: "REKAP ANOMALI",
        icon: "",
        route: "/performance/rekapanomali",
      },
      {
        id: "performance-2",
        label: "PROSENTASE ANOMALI UPT",
        icon: "",
        route: "/performance/persentasianimali",
      },
    ],
  },
  {
    id: "kinerja",
    label: "KINERJA",
    icon: "/Time_progress_fill.svg",
    route: "/kinerja",
    hasChildren: true,
    children: [
      {
        id: "kinerja-1",
        label: "UPT",
        icon: "",
        route: "/kinerja/upt",
      },
      {
        id: "kinerja-2",
        label: "ULTG",
        icon: "",
        route: "/kinerja/ultg",
      },
    ],
  },
  {
    id: "monitoring",
    label: "MONITORING",
    icon: "/monitoring.svg",
    route: "/monitoring",
    hasChildren: true,
    children: [
      {
        id: "monitoring-1",
        label: "LEAD MEASURE",
        icon: "",
        route: "/monitoring/lead-measure",
      },
      {
        id: "monitoring-2",
        label: "ANGGARAN",
        icon: "",
        route: "/monitoring/anggaran",
      },
      {
        id: "monitoring-3",
        label: "KONSTRUKSI",
        icon: "",
        hasChildren: true,
        children: [
          {
            id: "konstruksi-1",
            label: "ADKON DALKON",
            icon: "",
            route: "/monitoring/konstruksi/adkondalkon",
          },
          {
            id: "konstruksi-2",
            label: "LOGISTIK",
            icon: "",
            hasChildren: true,
            children: [
              {
                id: "konstruksi-2-1",
                label: "MONITORING GUDANG",
                icon: "",
                route: "/monitoring/konstruksi/logistik/monitoringgudang",
              },
              {
                id: "konstruksi-2-2",
                label: "SIGESIT",
                icon: "",
                route: "/monitoring/konstruksi/logistik/sigesit",
              },
            ],
          },
        ],
      },
      {
        id: "monitoring-4",
        label: "HSSE PERFORMANCE",
        icon: "",
        hasChildren: true,
        children: [
          {
            id: "hsse-1",
            label: "JADWAL PEKERJAAN K3",
            icon: "",
            route: "/monitoring/hsse/jadwalk3",
          },
          {
            id: "hsse-2",
            label: "PERALATAN DAN SARANA",
            icon: "",
            route: "/monitoring/hsse/perandsar",
          },
          {
            id: "hsse-3",
            label: "MATURING LEVEL HSSE",
            icon: "",
            route: "/monitoring/hsse/levelhsse",
          },
          {
            id: "hsse-4",
            label: "MATURING LEVEL SUSTAINABILITY",
            icon: "",
            route: "/monitoring/hsse/sustainability",
          },
        ],
      },
    ],
  },
];
