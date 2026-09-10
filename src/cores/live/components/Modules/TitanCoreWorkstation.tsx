import React, { useState, useEffect, useRef } from 'react';
import { 
  Cpu, 
  Zap, 
  Database, 
  Activity, 
  Volume2, 
  VolumeX, 
  Play, 
  Settings, 
  Layers, 
  ShieldAlert, 
  Info, 
  HardDrive, 
  Thermometer, 
  Wind, 
  Tv, 
  RotateCw, 
  CheckCircle,
  Sparkles,
  Terminal,
  Power
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TitanCoreWorkstationProps {
  lang: 'id' | 'en';
}

type ComponentId = 'cpu' | 'gpu' | 'motherboard' | 'ram' | 'storage' | 'cooling' | 'power' | 'software' | 'peripherals';

interface HardwareItem {
  id: ComponentId;
  name: string;
  category: string;
  icon: any;
  specs: {
    id: {
      title: string;
      brand: string;
      desc: string;
      details: string[];
    };
    en: {
      title: string;
      brand: string;
      desc: string;
      details: string[];
    };
  };
  telemetry: {
    loadName: string;
    loadUnit: string;
    loadBase: number;
    tempBase: number;
    voltageBase: number;
    healthBase: number;
  };
}

// Full hardware specs
const HARDWARE_DATA: HardwareItem[] = [
  {
    id: 'cpu',
    name: 'Ryzen 9 9950X3D',
    category: 'Processor',
    icon: Cpu,
    specs: {
      id: {
        title: 'AMD Ryzen 9 9950X3D',
        brand: 'AMD Flagship Ryzen 9000 Series (Rilis: Awal 2025 | Harga: ~$849 / Rp 13.584.000,-)',
        desc: 'Prosesor unggulan generasi Zen 5 yang dilengkapi dengan 3D V-Cache revolusioner. Memiliki 16 core fisik dan 32 thread komputasi untuk menangani simulasi fisika batuan, visualisasi 3D, serta pemrosesan multi-agent LLM lokal secara simultan tanpa hambatan.',
        details: [
          'Tahun Rilis: Awal 2025 (Ketersediaan ritel kuartal pertama)',
          'Harga Ritel (MSRP): ~$849 USD (Estimasi sekitar Rp 13.584.000,- dengan kurs stabil Rp 16.000 per USD)',
          'Arsitektur & Fabrikasi: Zen 5 dengan teknologi sirkuit silikon TSMC 4nm FinFET tercanggih',
          'Core / Thread: 16 Cores / 32 Threads berkecepatan boost clock maksimal hingga 5.7 GHz secara simultan',
          'Teknologi Cache: L3 Cache raksasa sebesar 144MB dengan tumpukan silikon 3D V-Cache generasi terbaru yang secara drastis memotong latency komunikasi memori',
          'Instruksi Akselerasi: Dukungan penuh set instruksi AVX-512 secara native untuk pengolahan vektor gelombang seismik dan tensor matematika berat 2x lipat lebih cepat',
          'Batas Daya (TDP): TDP standar 120W, namun dioptimalkan di bawah pendinginan loop tembaga kustom ekstrim agar tetap stabil tanpa thermal throttling saat komputasi penuh'
        ]
      },
      en: {
        title: 'AMD Ryzen 9 9950X3D',
        brand: 'AMD Flagship Ryzen 9000 Series (Released: Early 2025 | Price: ~$849 / IDR 13,584,000)',
        desc: 'The ultimate Zen 5 processor engineered with groundbreaking 3D V-Cache technology. Packing 16 physical cores and 32 threads, it handles heavy rock physics modeling, Three.js 3D renders, and local multi-agent AI swarm simulations simultaneously with zero bottlenecks.',
        details: [
          'Release Year: Early 2025 (Official global retail availability Q1 2025)',
          'MSRP / Street Price: ~$849 USD (Equivalent to approximately IDR 13,584,000 based on a stable rate of IDR 16,000 per USD)',
          'Architecture & Node: Cutting-edge Zen 5 microarchitecture manufactured on TSMC\'s ultra-dense 4nm FinFET lithography',
          'Cores / Threads: 16 Physical Cores / 32 Logical Threads, scaling boost clocks up to a blisteringly fast 5.7 GHz',
          'Cache Memory: 144MB L3 Cache utilizing advanced 3D V-Cache stacked silicon layout, virtually eliminating memory pipeline latencies',
          'Vector Support: Native AVX-512 instruction pipelines, providing up to a 2x throughput boost for seismic wave modeling and tensor equations',
          'Power Management: 120W Stock TDP, extensively tuned and operating well below thermal thresholds thanks to our extreme copper water loop'
        ]
      }
    },
    telemetry: {
      loadName: 'CPU Threads Load',
      loadUnit: '%',
      loadBase: 24,
      tempBase: 42,
      voltageBase: 1.22,
      healthBase: 100
    }
  },
  {
    id: 'gpu',
    name: 'Dual Strix RTX 5090 OC',
    category: 'Graphics / AI Compute',
    icon: Zap,
    specs: {
      id: {
        title: 'Dual ASUS ROG Strix GeForce RTX 5090 OC',
        brand: 'NVIDIA Blackwell Flagship Duo (Rilis: Awal 2025 | Harga: ~$4,998 / Rp 79.968.000,-)',
        desc: 'Dua buah kartu grafis flagship Blackwell RTX 5090 yang berjalan paralel untuk menghasilkan daya komputasi AI tensor yang tiada tanding. Menyediakan total memori video sebesar 64GB GDDR7 berkecepatan ekstrim, dirancang khusus untuk memuat model geofisika skala raksasa dan AI Swarm.',
        details: [
          'Tahun Rilis: Awal 2025 (Diumumkan perdana pada ajang CES 2025)',
          'Harga Ritel: ~$2,499 USD per unit, akumulasi ~$4,998 USD untuk dual-konfigurasi (Sekitar Rp 79.968.000,- dengan kurs Rp 16.000 per USD)',
          'Arsitektur Silikon: NVIDIA Blackwell TSMC 4N Custom Foundry, dioptimalkan untuk efisiensi komputasi superkomputer',
          'Alokasi VRAM Masif: Dual 32GB GDDR7 (Total 64GB VRAM Aktif) yang berjalan pada lebar bus 512-bit dengan bandwidth teoritis 1.8 TB/s per kartu',
          'Tensor Cores Generasi ke-5: Mendukung penuh format presisi mikro FP4 dan FP8 untuk mempercepat training dan eksekusi neural network lokal',
          'Desain Blok Air: Menggunakan water block tembaga lapis nikel (nickel-plated copper water blocks) kustom untuk pembuangan panas langsung lewat pendingin cairan',
          'Daya Komputasi Mentah: Menghasilkan daya komputasi tensor hingga ratusan TFLOPS, memungkinkan running LLM lokal berukuran besar (>70B parameter)'
        ]
      },
      en: {
        title: 'Dual ASUS ROG Strix GeForce RTX 5090 OC',
        brand: 'NVIDIA Blackwell Flagship Duo (Released: Early 2025 | Price: ~$4,998 / IDR 79,968,000)',
        desc: 'Two ultimate Blackwell RTX 5090 graphics cards running in parallel to achieve unrivaled AI tensor computing power. Packing a massive combined 64GB of lightning-fast GDDR7 memory, engineered specifically for parsing colossal subsurface geophysics matrices and localized AI models.',
        details: [
          'Release Year: Early 2025 (Debuted globally at CES 2025 to lead the high-performance computing segment)',
          'MSRP / Street Price: ~$2,499 USD per card, totaling ~$4,998 USD for the dual SLI/NVLink-free setup (Approx. IDR 79,968,000)',
          'Silicon Architecture: NVIDIA Blackwell microarchitecture built on a custom TSMC 4N foundry process',
          'Massive VRAM Pool: Dual 32GB GDDR7 (Combined 64GB active video memory) running on a massive 512-bit bus with 1.8 TB/s bandwidth per card',
          '5th Generation Tensor Cores: Optimally accelerated for native FP4, FP8, and FP16 low-precision deep learning computational pipelines',
          'Thermal Engineering: Outfitted with premium full-cover nickel-plated copper custom water blocks for direct integration into the water loop',
          'Local AI Throughput: Unleashes extreme compute capacity, facilitating real-time inference on massive local LLM parameters (>70B)'
        ]
      }
    },
    telemetry: {
      loadName: 'Tensor VRAM Alloc',
      loadUnit: 'GB',
      loadBase: 14.8,
      tempBase: 38,
      voltageBase: 0.98,
      healthBase: 99
    }
  },
  {
    id: 'motherboard',
    name: 'ASUS ROG X870E Extreme',
    category: 'System Board',
    icon: Layers,
    specs: {
      id: {
        title: 'ASUS ROG Crosshair X870E Extreme',
        brand: 'ASUS Premium ROG Motherboard (Rilis: Akhir 2024 | Harga: ~$999 / Rp 15.984.000,-)',
        desc: 'Papan induk kasta tertinggi yang menjadi fondasi kelistrikan TitanCore. Menyediakan 18+2+2 fase daya 110A untuk menyuplai daya bersih tanpa fluktuasi, serta mendukung penuh interkoneksi PCIe Gen 5 berkecepatan ultra tinggi untuk slot ekspansi NVMe.',
        details: [
          'Tahun Rilis: Akhir 2024 (Dirilis mendampingi peluncuran prosesor AMD Ryzen seri terbaru)',
          'Harga Ritel (MSRP): ~$999 USD (Kira-kira Rp 15.984.000,- dengan nilai tukar Rp 16.000 per USD)',
          'Desain Daya VRM: 18+2+2 Fase Daya dengan choke logam padat dan kapasitor hitam metalik 10K hitam untuk arus stabil hingga 110A',
          'Arsitektur Slot: Slot PCIe 5.0 x16 ganda berlapis baja SafeSlot berkekuatan struktural tinggi untuk memikul beban dual kartu grafis',
          'Konektivitas Eksternal: Dua port USB4 berkecepatan penuh 40Gbps, modul nirkabel Wi-Fi 7 internal, serta port ethernet kabel ultra-cepat 10Gb Marvell Aquantia',
          'Sistem Kontrol BIOS: ROG UEFI kanggul yang dipersenjatai teknologi AI Overclocking pintar dan modul Dynamic OC Switcher'
        ]
      },
      en: {
        title: 'ASUS ROG Crosshair X870E Extreme',
        brand: 'ASUS Premium ROG Motherboard (Released: Late 2024 | Price: ~$999 / IDR 15,984,000)',
        desc: 'The top-tier mainboard serving as the rock-solid electronic foundation of TitanCore. Boasting 18+2+2 power phases rated at 110A for clean, ripple-free power delivery, and fully supporting dual PCIe Gen 5 interconnects for high-speed NVMe expansion arrays.',
        details: [
          'Release Year: Late 2024 (Launched globally to host the flagship Zen 5 desktop processors)',
          'MSRP / Street Price: ~$999 USD (Roughly equivalent to IDR 15,984,000 using a exchange index of IDR 16,000 per USD)',
          'VRM Design: Robust 18+2+2 smart power stages utilizing 110A power rating and military-grade 10K black metallic capacitors',
          'PCIe Expansion: Dual physical PCIe 5.0 x16 lanes reinforced with SafeSlot steel shielding to support heavy waterblocked GPUs',
          'Next-Gen I/O: Dual USB4 ports (40Gbps), integrated Wi-Fi 7 with directional antenna arrays, and a Marvell Aquantia 10Gb ultra LAN',
          'Intelligent Control: ROG UEFI BIOS with proprietary AI Overclocking, AI Cooling II, and dynamic hardware profiling algorithms'
        ]
      }
    },
    telemetry: {
      loadName: 'VRM Current Draw',
      loadUnit: 'A',
      loadBase: 68,
      tempBase: 44,
      voltageBase: 1.18,
      healthBase: 100
    }
  },
  {
    id: 'ram',
    name: '256GB Fury DDR5 6000MHz',
    category: 'System Memory',
    icon: Activity,
    specs: {
      id: {
        title: '256GB Kingston Fury Beast DDR5 RGB',
        brand: 'Extreme Density DDR5 Memory (Rilis: Pertengahan 2024 | Harga: ~$1,199 / Rp 19.184.000,-)',
        desc: 'Kapasitas RAM raksasa sebesar 256GB yang tersusun atas 4 keping modul 64GB DDR5. Dikonfigurasi secara presisi dengan profil AMD EXPO pada frekuensi 6000MHz dan latensi rendah CL30, menjamin proses kompilasi kode dan pemrosesan data volume seismik 3D berjalan instan.',
        details: [
          'Tahun Rilis: Pertengahan 2024 (Menyusul pengenalan modul memori non-ECC berdensitas tinggi 64GB pertama ke pasar konsumen)',
          'Harga Ritel: ~$1,199 USD untuk paket kit quad-channel lengkap (Setara Rp 19.184.000,- dengan kurs Rp 16.000 per USD)',
          'Kapasitas & Saluran: Memori sistem 256 Gigabyte masif (Susunan modul 4 keping x 64GB dalam arsitektur Quad-Channel)',
          'Frekuensi & Latensi: Berjalan stabil pada frekuensi tinggi 6000 MT/s dengan profil sub-timing latensi sangat rendah CL30-36-36-76',
          'Sertifikasi Profil: AMD EXPO Certified, menjamin kestabilan transfer data antara bus CPU dan RAM di sistem AMD',
          'Sistem Pembuang Panas: Heatsink aluminium hitam anodized dengan diffuser lampu LED RGB futuristik yang tersinkronisasi Asus Aura Sync'
        ]
      },
      en: {
        title: '256GB Kingston Fury Beast DDR5 RGB',
        brand: 'Extreme Density DDR5 Memory (Released: Mid 2024 | Price: ~$1,199 / IDR 19,184,000)',
        desc: 'Colossal 256GB of system memory configured using 4 ultra-dense 64GB DDR5 modules. Running AMD EXPO profiles at a sweet-spot frequency of 6000MHz with tight CL30 latencies, ensuring lightning-fast memory allocations for compiling databases and parsing 3D seismic volume voxels.',
        details: [
          'Release Year: Mid 2024 (Unveiled following the commercial release of high-density 64GB consumer-grade DDR5 memory ICs)',
          'MSRP / Street Price: ~$1,199 USD for the complete quad-channel kit (Equivalent to IDR 19,184,000 at IDR 16,000 per USD)',
          'Configuration: 256 Gigabytes total capacity composed of four identical 64GB high-density modules in Quad-Channel alignment',
          'Speed & Latencies: Factory-tuned at a stellar 6000 MT/s rate with tight latency specifications of CL30-36-36-76 at 1.4V',
          'Overclock Profiles: AMD EXPO Certified for instant profile recognition and seamless boot integration on AM5 platforms',
          'Aesthetics: Premium low-profile black anodized aluminum heatsinks integrated with custom addressable RGB LED diffusers'
        ]
      }
    },
    telemetry: {
      loadName: 'Active Memory Allocation',
      loadUnit: 'GB',
      loadBase: 114.2,
      tempBase: 49,
      voltageBase: 1.40,
      healthBase: 100
    }
  },
  {
    id: 'storage',
    name: '72TB Storage Array (NVMe/SATA)',
    category: 'Storage Array',
    icon: HardDrive,
    specs: {
      id: {
        title: '72TB High-Performance Storage Array',
        brand: 'Hybrid Speed-Cold Tier Storage (Rilis: 2020-2024 | Harga: ~$6,290 / Rp 100.640.000,-)',
        desc: 'Kombinasi media penyimpanan hibrida dengan total kapasitas melebihi 72 Terabyte. Dibagi menjadi Speed Tier (NVMe Gen 5 & Gen 4 super cepat untuk sistem operasi dan database aktif) serta Cold Tier (SATA SSD berkapasitas besar untuk mencadangkan data seismografi historis sumur bor).',
        details: [
          'Tahun Rilis: Komponen dirilis bertahap sejak 2020 (Samsung QVO) hingga 2024 (TeamGroup Gen5 NVMe)',
          'Harga Ritel Kumulatif: ~$6,290 USD (Kira-kira Rp 100.640.000,- dengan rincian SSD Gen5, Gen4 NVMe, dan 7x 8TB SSD SATA)',
          'Tingkat Kecepatan (16TB NVMe): 2x TeamGroup T-FORCE GE PRO 4TB Gen5 (Baca: 14.000 MB/s), 1x Samsung 990 PRO 4TB, dan 2x Crucial T500 4TB pada kartu ekspansi PCIe 5.0 khusus ASUS Hyper M.2',
          'Tingkat Kapasitas (56TB SATA): 7 unit SSD Samsung 870 QVO 8TB untuk kubah penyimpanan arsip seismologi berukuran raksasa',
          'Ketahanan Tulis (TBW): Akumulasi rating penulisan melebihi 15.000 Terabytes Written (TBW) secara kumulatif',
          'Arsitektur Keamanan: Dikonfigurasi menggunakan software-driven RAID-10 pada speed tier untuk perlindungan data instan tanpa delay'
        ]
      },
      en: {
        title: '72TB High-Performance Storage Array',
        brand: 'Hybrid Speed-Cold Tier Storage (Released: 2020-2024 | Price: ~$6,290 / IDR 100,640,000)',
        desc: 'A massive hybrid storage array exceeding 72 Terabytes of solid-state storage. Logically partitioned into an ultra-fast Speed Tier (Gen 5 & Gen 4 NVMe for operating systems and raw drilling databases) and a Cold Tier (dense SATA SSD array for cold backups of historical well log data).',
        details: [
          'Release Year: Individual drives released progressively between 2020 (SATA QVO array) and 2024 (Gen 5 high-speed NVMe)',
          'Combined MSRP Cost: ~$6,290 USD (Approximately IDR 100,640,000, bringing together high-performance NVMe and SATA arrays)',
          'Speed Tier (16TB NVMe): 2x TeamGroup T-FORCE GE PRO 4TB Gen5 (14,000 MB/s read, 11,800 MB/s write) + 1x Samsung 990 PRO 4TB (7,450 MB/s) + 2x Crucial T500 4TB (7,400 MB/s) mounted on a PCIe 5.0 ASUS Hyper card',
          'Cold Tier (56TB SATA): 7x Samsung 870 QVO 8TB solid state drives acting as a massive local geophysics archive vault',
          'Endurance Rating: Aggregated writing threshold exceeding 15,000 TBW (Terabytes Written) to guarantee long-term data integrity',
          'RAID Topography: Optimized using software-driven RAID-10 for the NVMe speed tier to ensure robust real-time disk redundancy'
        ]
      }
    },
    telemetry: {
      loadName: 'Storage Write Speed',
      loadUnit: 'MB/s',
      loadBase: 420,
      tempBase: 36,
      voltageBase: 3.32,
      healthBase: 98
    }
  },
  {
    id: 'cooling',
    name: 'Custom Loop (35 Fans + Triple Rads)',
    category: 'Cooling Loop',
    icon: Wind,
    specs: {
      id: {
        title: 'Corsair Hydro X Custom Acrylic Hardline Loop',
        brand: 'Extreme Liquid Engineering (Rilis: 2023-2024 | Harga: ~$1,800 / Rp 28.800.000,-)',
        desc: 'Sistem pendingin cairan kustom ultra ekstrim dengan pipa akrilik keras (hardline tubing) berdiameter 14mm. Menyertakan pompa XD5 Elite D5 RGB, tiga buah radiator tebal 480mm tembaga, serta total 35 kipas aktif Noctua dan Lian Li untuk memastikan perpindahan panas dari CPU dan Dual GPU berjalan sempurna.',
        details: [
          'Tahun Rilis: Iterasi bagian custom loop rilis terus menerus sepanjang 2023 hingga 2024 (Sistem pompa Elite diluncurkan akhir 2023)',
          'Harga Ritel Kumulatif: ~$1,800 USD (Kira-kira Rp 28.800.000,- mencakup radiator tebal, fittings fitting, dual blok air, cairan, dan kipas)',
          'Radiator Tembaga: 3x Corsair XR7 480mm dengan ketebalan sirip tembaga murni 54mm untuk area disipasi panas maksimal',
          'Kipas Radiator Atas: 12x kipas industri berdaya dorong tinggi Noctua NF-A14 industrialPPC-3000 RPM PWM (konfigurasi tri-layer push-pull-pull)',
          'Kipas Panel Depan & Exhaust: 16x kipas Lian Li SL-Infinity 140 PWM pada sasis, 3x Noctua NF-F12 iPPC-2000 pada AIO samping, serta 4x kipas bantu exhaust belakang',
          'Tekanan Udara Sasis: Dikonfigurasi dalam tekanan udara positif penuh guna menghalau penumpukan partikel debu halus di dalam kabin super tower Corsair 9000D'
        ]
      },
      en: {
        title: 'Corsair Hydro X Custom Acrylic Hardline Loop',
        brand: 'Extreme Liquid Engineering (Released: 2023-2024 | Price: ~$1,800 / IDR 28,800,000)',
        desc: 'An extreme custom cooling loop with 14mm frosted hardline acrylic tubing. Powered by a high-pressure XD5 Elite D5 pump/reservoir combo, three massive 480mm copper radiators, and a staggering 35 active fans from Noctua and Lian Li, keeping dual 5090 GPUs and the Zen 5 CPU completely chilled.',
        details: [
          'Release Year: Advanced loop components developed and integrated progressively over 2023-2024 (XD5 Elite pump debuted late 2023)',
          'Accumulated MSRP Cost: ~$1,800 USD (Approximately IDR 28,800,000, covers high-end blocks, industrial fittings, tubes, and performance coolant)',
          'Radiators: Triple Corsair XR7 480mm copper core radiators boasting a massive 54mm thickness for optimal passive thermal inertia',
          'Rad Fan Matrix: 12x industrial-grade Noctua NF-A14 industrialPPC-3000 RPM PWM fans stacked in extreme tri-layer push-pull-pull design',
          'Intake & Exhaust Walls: 16x Lian Li SL-Infinity 140 PWM fans at the front intake, 3x Noctua NF-F12 iPPC-2000 side-mounted, and 4x auxiliary exhaust blowers',
          'Chassis Environment: Tuned for high positive air pressure to ensure structural dust repulsion within the massive Corsair 9000D Super Tower'
        ]
      }
    },
    telemetry: {
      loadName: 'Coolant Flow Rate',
      loadUnit: 'L/h',
      loadBase: 245,
      tempBase: 29,
      voltageBase: 12.05,
      healthBase: 100
    }
  },
  {
    id: 'power',
    name: 'Super Flower 2000W + APC UPS',
    category: 'Power Delivery',
    icon: Power,
    specs: {
      id: {
        title: 'Super Flower Leadex 2000W ATX 3.1 & APC Smart-UPS',
        brand: 'Industrial Power Protection Suite (Rilis: 2023-2024 | Harga: ~$4,000 / Rp 64.000.000,-)',
        desc: 'Infrastruktur kelistrikan tingkat industri untuk menjamin kestabilan suplai daya. Menggunakan power supply Super Flower Leadex Titanium 2000W ATX 3.1 ganda yang dipasangkan dengan uninterruptible power supply APC Smart-UPS 3000VA berkapasitas baterai eksternal tambahan.',
        details: [
          'Tahun Rilis: Power supply Super Flower Leadex 2000W rilis 2024; APC Smart-UPS 3000VA rilis berkelanjutan dengan sel baterai aktif generasi 2023',
          'Harga Ritel Kumulatif: ~$4,000 USD (Sekitar Rp 64.000.000,- dengan rincian unit PSU Leadex 2000W seharga Rp 8.000.000,- dan APC Smart-UPS SRT3000XLI seharga Rp 56.000.000,-)',
          'Unit PSU Utama: Super Flower Leadex Titanium 2000W ATX 3.1 (Mendukung kabel daya native 12V-2x6 untuk meredam fluktuasi daya dual GPU secara instan)',
          'Efisiensi Rating: Bersertifikat resmi 80-Plus Titanium (Menyajikan efisiensi konversi daya listrik murni mencapai hingga 94% pada beban kerja medium)',
          'Unit Pengaman UPS: APC Smart-UPS 3000VA LCD 230V Online Double Conversion (SRT3000XLI) dengan modul eksternal sirkuit baterai tambahan SRT192BP2',
          'Waktu Cadangan (Runtime): Mampu menyediakan waktu cadangan daya hingga ~35 menit saat terjadi blackout total agar komputer dapat dimatikan dengan aman'
        ]
      },
      en: {
        title: 'Super Flower Leadex 2000W ATX 3.1 & APC Smart-UPS',
        brand: 'Industrial Power Protection Suite (Released: 2023-2024 | Price: ~$4,000 / IDR 64,000,000)',
        desc: 'An enterprise-grade electrical infrastructure ensuring absolute runtime uptime. Powered by the dual-rail Super Flower Leadex Titanium 2000W ATX 3.1 power supply, coupled with an APC Smart-UPS 3000VA unit outfitted with extended external battery modules.',
        details: [
          'Release Year: Super Flower Titanium PSU released in 2024; APC Smart-UPS SRT line updated and maintained with 2023 battery chemistry cells',
          'Aggregate Retail Cost: ~$4,000 USD (Approximately IDR 64,000,000, accounting for the Leadex 2000W PSU at ~$500 and the APC SRT3000XLI Online UPS at ~$3,500)',
          'Power Supply Specs: Super Flower Leadex Titanium 2000W compliant with ATX 3.1, supplying clean power via dual native 12V-2x6 PCIe 5.0 connectors',
          'Efficiency Rating: Certified 80-Plus Titanium, demonstrating up to 94% real-world power conversion efficiency to minimize electrical waste',
          'UPS Unit Architecture: APC Smart-UPS 3000VA (SRT3000XLI) Online Double Conversion UPS paired with dynamic external battery packs (SRT192BP2)',
          'Uptime Backup Window: Retains approximately ~35 minutes of uninterrupted pure sine wave runtime under full multi-tensor calculations'
        ]
      }
    },
    telemetry: {
      loadName: 'Workstation Load Draw',
      loadUnit: 'W',
      loadBase: 840,
      tempBase: 41,
      voltageBase: 231.4,
      healthBase: 100
    }
  },
  {
    id: 'software',
    name: 'Windows 11 + NVIDIA CUDA AI Stack',
    category: 'Development Suite',
    icon: Terminal,
    specs: {
      id: {
        title: 'Enterprise AI & Development Stack',
        brand: 'Professional Simulation Suite (Rilis: Akhir 2024 | Harga: ~$900 / Rp 14.400.000,-)',
        desc: 'Ekosistem perangkat lunak yang dikonfigurasi secara optimal untuk pemrosesan AI lokal. Menjalankan Windows 11 Pro Enterprise yang disinkronkan dengan runtime NVIDIA CUDA 12.6, pustaka cuDNN, kerangka kerja PyTorch lokal, editor DaVinci Resolve Studio 12K, dan Google GenAI SDK.',
        details: [
          'Tahun Rilis: OS Windows 11 Enterprise LTSC rilis akhir 2024; CUDA Toolkit 12.6 dan PyTorch 2.5 rilis kuartal keempat 2024',
          'Harga Lisensi Ritel: ~$900 USD secara kumulatif (Windows Enterprise License ~$350, DaVinci Resolve Studio ~$299, pustaka AI/n8n open-source berlisensi komersial bebas)',
          'Sistem Operasi: Windows 11 Pro Enterprise LTSC (Edisi bisnis berdaya tahan tinggi, bersih tanpa bloatware konsumen ataupun pemantau telemetri latar)',
          'Akselerasi Driver: NVIDIA Studio Driver, disertifikasi untuk stabilitas render aplikasi rekayasa dan komputasi sains CUDA jangka panjang',
          'Tumpukan Deep Learning: PyTorch 2.5 terintegrasi dengan CUDA 12.6 dan cuDNN 9.2 untuk mempercepat inferensi geologi di dalam VRAM kartu grafis',
          'Konektivitas Cloud: Terkoneksi secara server-side ke Google GenAI Node.js SDK untuk mengakses model Gemini 3.5 Flash secara aman tanpa membocorkan kunci API'
        ]
      },
      en: {
        title: 'Enterprise AI & Development Stack',
        brand: 'Professional Simulation Suite (Released: Late 2024 | Price: ~$900 / IDR 14,400,000)',
        desc: 'A robust software ecosystem tuned for localized neural networks and heavy workflows. Running Windows 11 Pro Enterprise fully optimized with NVIDIA CUDA 12.6 runtimes, cuDNN libraries, localized PyTorch models, DaVinci Resolve Studio 12K, and the Google GenAI TypeScript SDK.',
        details: [
          'Release Year: Windows 11 Enterprise LTSC released late 2024; NVIDIA CUDA Toolkit 12.6 and PyTorch 2.5 deployed in Q4 2024',
          'Aggregate Retail Value: ~$900 USD (Includes commercial licensing for Windows Enterprise at ~$350, DaVinci Resolve Studio at ~$299, with open-source AI suites)',
          'Operating System Base: Windows 11 Pro Enterprise LTSC, providing a stripped-down, bloatware-free kernel maximizing available physical thread threads',
          'Graphics Drivers: NVIDIA Studio Drivers, certified specifically for workstation stability, memory leak containment, and CUDA operations',
          'Deep Learning Framework: PyTorch 2.5 compiled with native CUDA 12.6 and cuDNN 9.2 support, achieving microsecond tensor training loops',
          'API Security Layer: Fully integrated backend Node.js proxies hosting the Google GenAI SDK to route Gemini 3.5 Flash calls without browser key exposure'
        ]
      }
    },
    telemetry: {
      loadName: 'Active CUDA Threads',
      loadUnit: 'K',
      loadBase: 16.2,
      tempBase: 0,
      voltageBase: 0,
      healthBase: 100
    }
  },
  {
    id: 'peripherals',
    name: 'OLED AW3225QF + Magnus Pro Desk',
    category: 'Workstation Environment',
    icon: Tv,
    specs: {
      id: {
        title: 'Alienware AW3225QF OLED & Secretlab Magnus Pro',
        brand: 'Premium Ergonomic Desktop Ecosystem (Rilis: 2022-2024 | Harga: ~$3,500 / Rp 56.000.000,-)',
        desc: 'Kompleks ruang kendali fisik yang dirancang khusus untuk meningkatkan fokus pengembang. Berpusat pada monitor Alienware 32" QD-OLED beresolusi 4K dengan refresh rate 240Hz, didukung meja logam magnetis Secretlab Magnus Pro XL berfitur penyesuaian tinggi elektrik, serta kursi ergonomis Rexus Dark Thrones.',
        details: [
          'Tahun Rilis: Monitor AW3225QF dirilis awal 2024; Meja Secretlab Magnus Pro XL dirilis akhir 2022; Aksesoris rilis rentang 2023-2024',
          'Harga Ritel Kumulatif: ~$3,500 USD (Kira-kira Rp 56.000.000,- mencakup Alienware QD-OLED seharga Rp 19.500.000,-, meja Magnus Pro seharga Rp 16.000.000,-, kursi, audio, dan mouse/keyboard kustom)',
          'Display Visual Utama: Monitor lengkung 32 inci Alienware AW3225QF 4K (3840x2160) QD-OLED beresolusi tinggi, refresh rate 240Hz, dan respons piksel kilat 0.03ms GtG',
          'Sistem Kerja Fisik: MejaSecretlab Magnus Pro XL sit-to-stand bertenaga motor ganda dengan sistem kelistrikan internal dan baki kabel magnetis',
          'Sistem Reproduksi Suara: Speaker aktif monitor kayu Kanto YU2 dihubungkan ke Web Audio API untuk memproses sonifikasi akustik geofisika resolusi tinggi',
          'Input Kontrol: Keyboard mekanis kustom dengan switch linear senyap untuk meredam gangguan suara ketikan di sela-sela debugging'
        ]
      },
      en: {
        title: 'Alienware AW3225QF OLED & Secretlab Magnus Pro',
        brand: 'Premium Ergonomic Desktop Ecosystem (Released: 2022-2024 | Price: ~$3,500 / IDR 56,000,000)',
        desc: 'The physical control deck designed for hyper-focused development sessions. Centered around a premium curved Alienware 32" QD-OLED 4K 240Hz monitor, mounted on a dual-motor Secretlab Magnus Pro XL standing metal desk, and paired with a Rexus Dark Thrones ergonomic posture chair.',
        details: [
          'Release Year: Alienware AW3225QF monitor released early 2024; Secretlab Magnus Pro XL desk debuted late 2022; accessories released 2023-2024',
          'Aggregate Retail Value: ~$3,500 USD (Approximately IDR 56,000,000, bringing together the AW3225QF QD-OLED at ~$1,200, Magnus Pro XL desk at ~$1,000, plus audio/input gear)',
          'Primary Workspace Display: Curved 32-inch Alienware QD-OLED (AW3225QF) 4K display, utilizing Quantum Dot luminance with 240Hz speed and 0.03ms gray-to-gray transitions',
          'Smart Ergonomic Desk: Secretlab Magnus Pro XL dual-motor height-adjustable desk featuring a physical built-in power column and heavy steel construction',
          'Acoustic Playback Engine: Custom Kanto YU2 active wooden desktop monitor speakers connected to output the Web Audio API geophysical sonic frequencies',
          'Keyboard & Mouse: Custom mechanical keyboard with silent linear switches and custom ergonomic mouse layout to prevent wrist fatigue during continuous coding sessions'
        ]
      }
    },
    telemetry: {
      loadName: 'Display Bandwidth',
      loadUnit: 'Gb/s',
      loadBase: 78.4,
      tempBase: 42,
      voltageBase: 19.5,
      healthBase: 100
    }
  }
];

export default function TitanCoreWorkstation({ lang }: TitanCoreWorkstationProps) {
  const [powerState, setPowerState] = useState<'off' | 'booting' | 'on'>('on');
  const [bootProgress, setBootProgress] = useState(100);
  const [fanSpeed, setFanSpeed] = useState<'silent' | 'balanced' | 'turbo'>('balanced');
  const [rgbMode, setRgbMode] = useState<'zen' | 'titan' | 'drift'>('titan');
  const [selectedComp, setSelectedComp] = useState<ComponentId>('cpu');
  const [bootLogs, setBootLogs] = useState<string[]>([]);
  const [isMuted, setIsMuted] = useState(false);

  // Maintenance Checklist with persistent/reactive state
  const [tasks, setTasks] = useState([
    { id: 1, idLabel: 'Pembilasan cairan pendingin tahunan (Loop flush)', enLabel: 'Annual custom coolant flush', done: true },
    { id: 2, idLabel: 'Pembersihan debu kompresor 2-bulanan', enLabel: 'Bi-monthly compressor air dusting', done: true },
    { id: 3, idLabel: 'Inspeksi UV akrilik fitting kebocoran', enLabel: 'UV acrylic leak & seal inspection', done: false },
    { id: 4, idLabel: 'Repaste CPU Thermal Grizzly Kryonaut', enLabel: 'Thermal Grizzly Kryonaut CPU repasting', done: false },
    { id: 5, idLabel: 'Kalibrasi baterai UPS APC 3000VA', enLabel: 'APC 3000VA UPS battery cell calibration', done: true },
  ]);

  // Audio refs for localized hum synthesizer
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);

  // Calculate dynamic telemetry based on Fan Speed and Selected Component
  const activeCompData = HARDWARE_DATA.find(c => c.id === selectedComp)!;

  // Derive live telemetry with physical realism adjustments
  const getSimulatedTelemetry = () => {
    let multiplier = 1.0;
    let tempOffset = 0;
    let decibels = 34;
    let totalFansRPM = 1800;

    if (fanSpeed === 'silent') {
      multiplier = 0.85;
      tempOffset = 12; // Runs warmer under silent profile
      decibels = 21;
      totalFansRPM = 850;
    } else if (fanSpeed === 'turbo') {
      multiplier = 1.15;
      tempOffset = -9; // Frosty under extreme high-speed exhaust
      decibels = 49;
      totalFansRPM = 3000;
    }

    const baseTemp = activeCompData.telemetry.tempBase;
    const baseLoad = activeCompData.telemetry.loadBase;
    
    // Animate a bit of noise wobble
    const wobble = Math.sin(Date.now() / 1000) * 2;
    
    const temp = baseTemp > 0 ? Math.round((baseTemp * multiplier) + tempOffset + (wobble * 0.5)) : 0;
    const load = activeCompData.id === 'power' 
      ? Math.round((activeCompData.telemetry.loadBase * (fanSpeed === 'turbo' ? 1.2 : fanSpeed === 'silent' ? 0.9 : 1.0)) + (wobble * 5))
      : activeCompData.telemetry.loadBase > 0 
        ? Math.round((activeCompData.telemetry.loadBase * multiplier) + wobble) 
        : 0;

    const voltage = activeCompData.telemetry.voltageBase > 0 
      ? Number((activeCompData.telemetry.voltageBase * (fanSpeed === 'turbo' ? 1.05 : fanSpeed === 'silent' ? 0.96 : 1.00)).toFixed(2)) 
      : 0;

    return {
      temp,
      load: Math.max(0, load),
      voltage,
      health: activeCompData.telemetry.healthBase,
      noise: decibels,
      rpm: totalFansRPM
    };
  };

  const tele = getSimulatedTelemetry();

  // Web Audio synth for the fan hum
  const initOrUpdateFanHum = () => {
    if (powerState !== 'on' || isMuted) {
      cleanupAudio();
      return;
    }

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContextClass();
        oscRef.current = audioCtxRef.current.createOscillator();
        gainRef.current = audioCtxRef.current.createGain();
        filterRef.current = audioCtxRef.current.createBiquadFilter();

        oscRef.current.type = 'sawtooth';
        filterRef.current.type = 'lowpass';

        oscRef.current.connect(filterRef.current);
        filterRef.current.connect(gainRef.current);
        gainRef.current.connect(audioCtxRef.current.destination);
        oscRef.current.start();
      }

      const ctx = audioCtxRef.current;
      const osc = oscRef.current!;
      const gain = gainRef.current!;
      const filter = filterRef.current!;

      let freq = 45; // silent
      let vol = 0.015;
      let cut = 90;

      if (fanSpeed === 'balanced') {
        freq = 62;
        vol = 0.035;
        cut = 140;
      } else if (fanSpeed === 'turbo') {
        freq = 88;
        vol = 0.09;
        cut = 230;
      }

      osc.frequency.exponentialRampToValueAtTime(freq, ctx.currentTime + 0.6);
      filter.frequency.exponentialRampToValueAtTime(cut, ctx.currentTime + 0.6);
      gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.6);

    } catch (e) {
      console.warn("Audio Context init blocked or failed:", e);
    }
  };

  const cleanupAudio = () => {
    if (oscRef.current) {
      try { oscRef.current.stop(); } catch (e) {}
      oscRef.current = null;
    }
    if (audioCtxRef.current) {
      try { audioCtxRef.current.close(); } catch (e) {}
      audioCtxRef.current = null;
    }
    gainRef.current = null;
    filterRef.current = null;
  };

  useEffect(() => {
    initOrUpdateFanHum();
    return () => {
      cleanupAudio();
    };
  }, [powerState, fanSpeed, isMuted]);

  // Synthesize advanced sci-fi boot sound on Power Ignite button
  const triggerBootSequence = () => {
    if (powerState !== 'off') return;

    setPowerState('booting');
    setBootProgress(0);
    setBootLogs([]);

    const logs = [
      'INIT SYSTEM BIOS VER. 5.12.9... SUCCESS',
      'ACCELERATING DUAL-CHANNEL ATX 3.1 BUS...',
      'DETECTION ROUTINE: AMD RYZEN 9 9950X3D (32 LOGICAL CORES)',
      'LOADING DUAL STRIX RTX 5090 OC (64GB GDDR7 ALLOCATED)',
      'HYBRID COLD STORAGE ARRAY SCANNING... 72.84 TB ACTIVE',
      'ICUE SYSTEM COMM-XT HUBS CHECKING (5 CHANNELS)... NOMINAL',
      'LIQUID PUMP XD5 INTEGRATION... ACTIVE (245 L/H)',
      'TITANCORE V2 SANCTUARY FULLY POWERED.'
    ];

    // Play advanced synthesizer boot sound
    if (!isMuted) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const actx = new AudioContextClass();
          
          // Subsonic Bass drop
          const bOsc = actx.createOscillator();
          const bGain = actx.createGain();
          const bFilter = actx.createBiquadFilter();
          
          bOsc.type = 'sawtooth';
          bOsc.frequency.setValueAtTime(32, actx.currentTime);
          bOsc.frequency.exponentialRampToValueAtTime(64, actx.currentTime + 2.0);
          
          bFilter.type = 'lowpass';
          bFilter.frequency.setValueAtTime(70, actx.currentTime);
          bFilter.frequency.exponentialRampToValueAtTime(280, actx.currentTime + 2.0);
          
          bGain.gain.setValueAtTime(0.001, actx.currentTime);
          bGain.gain.linearRampToValueAtTime(0.25, actx.currentTime + 0.4);
          bGain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 2.2);
          
          bOsc.connect(bFilter);
          bFilter.connect(bGain);
          bGain.connect(actx.destination);
          
          // Charging Capacitor Sweep
          const cOsc = actx.createOscillator();
          const cGain = actx.createGain();
          
          cOsc.type = 'sine';
          cOsc.frequency.setValueAtTime(600, actx.currentTime);
          cOsc.frequency.exponentialRampToValueAtTime(3600, actx.currentTime + 1.8);
          
          cGain.gain.setValueAtTime(0.001, actx.currentTime);
          cGain.gain.linearRampToValueAtTime(0.04, actx.currentTime + 1.0);
          cGain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 1.8);
          
          cOsc.connect(cGain);
          cGain.connect(actx.destination);
          
          // Sequential Relay Switched clicks
          const relayClick = (time: number, pitch: number) => {
            const rOsc = actx.createOscillator();
            const rGain = actx.createGain();
            rOsc.type = 'triangle';
            rOsc.frequency.setValueAtTime(pitch, time);
            rGain.gain.setValueAtTime(0.12, time);
            rGain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
            rOsc.connect(rGain);
            rGain.connect(actx.destination);
            rOsc.start(time);
            rOsc.stop(time + 0.06);
          };
          
          relayClick(actx.currentTime + 0.2, 440);
          relayClick(actx.currentTime + 0.35, 510);
          relayClick(actx.currentTime + 1.2, 380);
          relayClick(actx.currentTime + 1.8, 680);

          bOsc.start();
          bOsc.stop(actx.currentTime + 2.4);
          cOsc.start();
          cOsc.stop(actx.currentTime + 2.4);
        }
      } catch (err) {
        console.warn(err);
      }
    }

    // Progress updates & sequential logging
    logs.forEach((log, index) => {
      setTimeout(() => {
        setBootLogs(prev => [...prev, `[system_log]: ${log}`]);
        setBootProgress(Math.round(((index + 1) / logs.length) * 100));
        
        if (index === logs.length - 1) {
          setPowerState('on');
        }
      }, (index + 1) * 350);
    });
  };

  const shutDownSystem = () => {
    cleanupAudio();
    setPowerState('off');
    setBootProgress(0);
    setBootLogs([]);
  };

  // Toggle Maintenance task status
  const handleToggleTask = (id: number) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
    // play soft click synth
    if (!isMuted) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const actx = new AudioContextClass();
          const osc = actx.createOscillator();
          const gain = actx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1000, actx.currentTime);
          gain.gain.setValueAtTime(0.05, actx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.05);
          osc.connect(gain);
          gain.connect(actx.destination);
          osc.start();
          osc.stop(actx.currentTime + 0.06);
        }
      } catch(e){}
    }
  };

  // Calculate Readiness Index based on checked tasks
  const readinessPercentage = Math.round((tasks.filter(t => t.done).length / tasks.length) * 100);

  // RGB Glowing gradient derived from active sync mode
  const getRgbGlowStyles = () => {
    if (powerState !== 'on') return 'from-black to-zinc-950 shadow-[0_0_15px_rgba(0,0,0,0.8)]';
    if (rgbMode === 'zen') {
      return 'from-[#220a0a] via-[#101012] to-black border-red-950/40 shadow-[0_0_35px_rgba(239,68,68,0.15)]';
    } else if (rgbMode === 'drift') {
      return 'from-[#052528] via-[#051c24] to-[#040e11] border-[#00E5FF]/20 shadow-[0_0_40px_rgba(0,229,255,0.2)]';
    } else {
      // titan mode - blazing neon orange, blue and gold aura
      return 'from-[#2a1305] via-[#13111c] to-[#030914] border-[#FF5722]/30 shadow-[0_0_45px_rgba(255,87,34,0.25)]';
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* HEADER CONTROLS */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-zinc-950 border border-zinc-900 rounded-xl p-4 gap-4">
        <div>
          <span className="text-[10px] bg-[#FF5722]/10 text-[#FF5722] border border-[#FF5722]/30 px-2.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider animate-pulse inline-block">
            {lang === 'id' ? 'INTEGRASI SPESIFIKASI WORKSTATION' : 'WORKSTATION DESIGN & SPECS'}
          </span>
          <h2 className="text-lg font-bold text-white uppercase font-mono mt-1 flex items-center gap-2">
            💻 TitanCore Chamber v2 (2025)
            <span className="text-xs text-[#00E5FF] font-normal tracking-wide lowercase">by Ivan</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            {lang === 'id' 
              ? 'Lingkungan komputasi ekstrim penunjang visualisasi 3D Mesh tanah dan Swarm AI lokal.' 
              : 'Extreme hardware ecosystem hosting high-performance subsurface models & local multi-agent AI debates.'}
          </p>
        </div>

        {/* UTILITIES */}
        <div className="flex items-center gap-2">
          {/* MUTE AUDIO HUM BUTTON */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
              isMuted 
                ? 'bg-red-950/20 text-red-400 border-red-900/30' 
                : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
            }`}
          >
            {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
            {isMuted 
              ? (lang === 'id' ? 'Unmute Audio PC' : 'Unmute PC Audio')
              : (lang === 'id' ? 'Mute Audio PC' : 'Mute PC Audio')
            }
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

        {/* COLUMN 1 (5/12 width): CHASSIS BLUEPRINT, CONTROLLER TUNER, & BOOT LOADER */}
        <div className="xl:col-span-5 space-y-6">
          
          {/* INTERACTIVE CHASSIS BLUEPRINT CARD */}
          <div className={`bg-gradient-to-br border rounded-2xl p-6 transition-all duration-1000 ${getRgbGlowStyles()}`}>
            
            {/* CARD TITLE & POWER ACTIONS */}
            <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-5">
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">Corsair 9000D Super Tower</span>
                <h3 className="text-sm font-bold text-white uppercase font-mono">CHASSIS BLUEPRINT MONITOR</h3>
              </div>

              {/* POWER IGNITE SWITCH */}
              {powerState === 'off' ? (
                <button
                  onClick={triggerBootSequence}
                  className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg text-xs font-mono font-black flex items-center gap-1.5 cursor-pointer transition-all shadow-lg shadow-emerald-500/25 active:scale-95"
                >
                  <Power size={13} className="animate-spin" />
                  POWER IGNITE
                </button>
              ) : powerState === 'booting' ? (
                <div className="px-3 py-1.5 bg-zinc-900 text-[#00E5FF] border border-[#00E5FF]/20 rounded-lg text-xs font-mono font-semibold flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-ping" />
                  BOOTING {bootProgress}%
                </div>
              ) : (
                <button
                  onClick={shutDownSystem}
                  className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/30 border border-red-900/40 text-red-400 rounded-lg text-xs font-mono font-bold flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Power size={12} />
                  Shutdown
                </button>
              )}
            </div>

            {/* MAIN VISUAL BLUEPRINT AREA */}
            <div className="relative h-72 border border-zinc-900/60 bg-black/60 rounded-xl overflow-hidden flex items-center justify-center p-4">
              
              {/* Standby State */}
              {powerState === 'off' && (
                <div className="text-center space-y-2 z-10">
                  <span className="w-3 h-3 bg-red-600 rounded-full inline-block animate-ping mb-2" />
                  <p className="text-xs font-mono text-zinc-600 uppercase tracking-wider font-bold">Chamber Standby Power Off</p>
                  <p className="text-[10px] text-zinc-700 font-mono max-w-xs mx-auto">Klik tombol 'POWER IGNITE' di atas untuk menyalakan sirkuit sirkulasi kustom dan modul akselerasi CUDA.</p>
                </div>
              )}

              {/* Booting Loader */}
              {powerState === 'booting' && (
                <div className="w-full max-w-xs space-y-4 font-mono text-xs z-10 p-4 bg-zinc-950/90 border border-zinc-900 rounded-lg">
                  <div className="flex justify-between items-center text-[#00E5FF] font-bold">
                    <span>BOOTING COMPRESSION CHANNELS...</span>
                    <span>{bootProgress}%</span>
                  </div>
                  <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                    <motion.div 
                      className="bg-[#00E5FF] h-full" 
                      style={{ width: `${bootProgress}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                  <div className="text-[9px] text-zinc-500 h-16 overflow-y-auto scrollbar-thin">
                    {bootLogs.slice(-3).map((l, i) => (
                      <div key={i} className="truncate">{l}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* ACTIVE SCHEMATIC */}
              {powerState === 'on' && (
                <div className="w-full h-full relative">
                  
                  {/* SVG DIAGRAM REPRESENTING INTERNAL DESIGN */}
                  <svg viewBox="0 0 320 220" className="w-full h-full text-zinc-500">
                    {/* Chassis Outline */}
                    <rect x="10" y="10" width="300" height="200" rx="10" fill="none" stroke="#2a2a30" strokeWidth="2" />
                    {/* Glass Window panel line */}
                    <rect x="15" y="15" width="290" height="190" rx="8" fill="none" stroke="#333" strokeDasharray="3 3" />

                    {/* TOP RADIATOR & THE 12 FAN BLADES */}
                    <g className="opacity-85">
                      <rect x="40" y="18" width="240" height="14" rx="2" fill="#222" stroke="#444" strokeWidth="0.5" />
                      {/* Top Fans circles */}
                      {[60, 100, 140, 180, 220, 260].map((cx, i) => (
                        <g key={i}>
                          <circle cx={cx} cy="25" r="5.5" fill="none" stroke="#666" strokeWidth="0.5" />
                          <line 
                            x1={cx} y1="19.5" x2={cx} y2="30.5" 
                            stroke={rgbMode === 'zen' ? '#ef4444' : rgbMode === 'drift' ? '#00FFCC' : '#FF9900'} 
                            strokeWidth="1"
                            className="origin-center"
                            style={{
                              transformBox: 'fill-box',
                              transformOrigin: 'center',
                              animation: `spin ${fanSpeed === 'turbo' ? '0.15s' : fanSpeed === 'silent' ? '1s' : '0.4s'} linear infinite`
                            }}
                          />
                        </g>
                      ))}
                      <text x="240" y="44" className="text-[8px] font-mono fill-zinc-600 uppercase text-right">Top Rad: Push-Pull</text>
                    </g>

                    {/* FRONT INTAKE FAN WALL (Right side intake) */}
                    <g className="opacity-85">
                      <rect x="282" y="40" width="14" height="140" rx="2" fill="#222" stroke="#444" strokeWidth="0.5" />
                      {/* Front fans */}
                      {[50, 80, 110, 140, 170].map((cy, i) => (
                        <g key={i}>
                          <circle cx="289" cy={cy} r="6" fill="none" stroke="#555" strokeWidth="0.5" />
                          <line 
                            x1="283" y1={cy} x2="295" y2={cy} 
                            stroke={rgbMode === 'zen' ? '#aa1111' : rgbMode === 'drift' ? '#00e5ff' : '#ff5722'} 
                            strokeWidth="1"
                            className="origin-center"
                            style={{
                              transformBox: 'fill-box',
                              transformOrigin: 'center',
                              animation: `spin ${fanSpeed === 'turbo' ? '0.18s' : fanSpeed === 'silent' ? '1.2s' : '0.45s'} linear infinite`
                            }}
                          />
                        </g>
                      ))}
                      <text x="275" y="194" className="text-[8px] font-mono fill-zinc-600 uppercase text-right">Front 16x SL-INF</text>
                    </g>

                    {/* MOTHERBOARD AREA */}
                    <g 
                      onClick={() => setSelectedComp('motherboard')}
                      className={`cursor-pointer transition-all ${selectedComp === 'motherboard' ? 'opacity-100 filter drop-shadow-[0_0_5px_rgba(255,87,34,0.5)]' : 'opacity-60 hover:opacity-85'}`}
                    >
                      <rect x="50" y="45" width="160" height="120" rx="4" fill="#151518" stroke={selectedComp === 'motherboard' ? '#FF5722' : '#333'} />
                      <text x="56" y="58" className="text-[8px] font-mono font-extrabold fill-zinc-500">ROG X870E EXTREME</text>
                    </g>

                    {/* CPU & COOLER WATER BLOCK */}
                    <g 
                      onClick={() => setSelectedComp('cpu')}
                      className={`cursor-pointer transition-all ${selectedComp === 'cpu' ? 'opacity-100' : 'opacity-65 hover:opacity-90'}`}
                    >
                      {/* CPU socket core */}
                      <rect x="105" y="65" width="40" height="40" rx="3" fill="#222" stroke={selectedComp === 'cpu' ? '#FF5722' : '#555'} strokeWidth="1" />
                      {/* Ryujin AIO screen */}
                      <circle cx="125" cy="85" r="14" fill="#050505" stroke="#00E5FF" strokeWidth="1" />
                      {/* Ryujin dynamic text display */}
                      <text x="125" y="88" textAnchor="middle" className="text-[6px] font-mono fill-[#00E5FF] font-extrabold animate-pulse">TITAN</text>
                    </g>

                    {/* RAM SLOTS */}
                    <g 
                      onClick={() => setSelectedComp('ram')}
                      className={`cursor-pointer transition-all ${selectedComp === 'ram' ? 'opacity-100' : 'opacity-65 hover:opacity-90'}`}
                    >
                      {[152, 158, 164, 170].map((x, i) => (
                        <rect 
                          key={i} x={x} y="62" width="3" height="45" rx="1" 
                          fill={rgbMode === 'zen' ? '#220000' : rgbMode === 'drift' ? '#00E5FF' : '#FF9900'} 
                          className="opacity-90"
                          style={{
                            animation: rgbMode === 'zen' ? 'pulse 2s infinite' : 'pulse 1s infinite'
                          }}
                        />
                      ))}
                    </g>

                    {/* DUAL GPU (SLOTS BELOW CPU) */}
                    <g 
                      onClick={() => setSelectedComp('gpu')}
                      className={`cursor-pointer transition-all ${selectedComp === 'gpu' ? 'opacity-100' : 'opacity-60 hover:opacity-90'}`}
                    >
                      {/* GPU 1 Waterblock block */}
                      <rect x="55" y="115" width="150" height="15" rx="2" fill="#111" stroke={selectedComp === 'gpu' ? '#FF5722' : '#444'} />
                      <line x1="58" y1="122.5" x2="202" y2="122.5" stroke="#00E5FF" strokeWidth="1" strokeDasharray="5 3" />
                      
                      {/* GPU 2 Waterblock block */}
                      <rect x="55" y="140" width="150" height="15" rx="2" fill="#111" stroke={selectedComp === 'gpu' ? '#FF5722' : '#444'} />
                      <line x1="58" y1="147.5" x2="202" y2="147.5" stroke="#00E5FF" strokeWidth="1" strokeDasharray="5 3" />
                      
                      <text x="130" y="152" textAnchor="middle" className="text-[7px] font-mono fill-zinc-500 font-bold uppercase">Dual Strix RTX 5090 Parallel</text>
                    </g>

                    {/* LIQUID LOOP ACRYLIC PIPES (Red/Orange or Neon Cyan fluid flowing) */}
                    <g className="opacity-75" strokeWidth="2.5" fill="none">
                      {/* Loop from Pump to GPU, CPU and Top Radiator */}
                      <path 
                        d="M 235,160 L 235,122 L 205,122" 
                        stroke={rgbMode === 'zen' ? '#ef4444' : rgbMode === 'drift' ? '#00e5ff' : '#ff5722'} 
                        strokeDasharray="6 4"
                        className="animate-[dash_1.5s_linear_infinite]"
                      />
                      <path 
                        d="M 205,147 L 225,147 L 225,95 L 145,95" 
                        stroke={rgbMode === 'zen' ? '#ef4444' : rgbMode === 'drift' ? '#00e5ff' : '#ff5722'} 
                        strokeDasharray="6 4"
                        className="animate-[dash_1.5s_linear_infinite]"
                      />
                      <path 
                        d="M 125,71 L 125,45 L 240,45" 
                        stroke={rgbMode === 'zen' ? '#990000' : rgbMode === 'drift' ? '#00ccaa' : '#ff9900'} 
                        strokeDasharray="6 4"
                        className="animate-[dash_2s_linear_infinite]"
                      />
                    </g>

                    {/* CUSTOM RESERVOIR & PUMP XD5 ELITE */}
                    <g 
                      onClick={() => setSelectedComp('cooling')}
                      className={`cursor-pointer transition-all ${selectedComp === 'cooling' ? 'opacity-100' : 'opacity-65 hover:opacity-95'}`}
                    >
                      <rect x="220" y="100" width="35" height="75" rx="4" fill="#08080a" stroke={selectedComp === 'cooling' ? '#00E5FF' : '#555'} />
                      {/* Fluid coolant level */}
                      <rect 
                        x="223" y="118" width="29" height="52" rx="2" 
                        fill={rgbMode === 'zen' ? '#ef4444' : rgbMode === 'drift' ? '#00E5FF' : '#FF5722'} 
                        className="opacity-45"
                      />
                      <text x="237" y="112" textAnchor="middle" className="text-[7px] font-mono fill-white font-bold">D5 PUMP</text>
                    </g>

                    {/* POWER PSU COVER (BOTTOM LEFT CABINET) */}
                    <g 
                      onClick={() => setSelectedComp('power')}
                      className={`cursor-pointer transition-all ${selectedComp === 'power' ? 'opacity-100' : 'opacity-65 hover:opacity-90'}`}
                    >
                      <rect x="20" y="170" width="130" height="32" rx="4" fill="#0d0d0f" stroke={selectedComp === 'power' ? '#00E5FF' : '#333'} />
                      <text x="28" y="188" className="text-[8px] font-mono fill-zinc-400 font-black">SUPER FLOWER 2000W</text>
                    </g>

                    {/* STORAGE SSD MASS CHANNEL GRID */}
                    <g 
                      onClick={() => setSelectedComp('storage')}
                      className={`cursor-pointer transition-all ${selectedComp === 'storage' ? 'opacity-100' : 'opacity-65 hover:opacity-90'}`}
                    >
                      <rect x="156" y="170" width="60" height="32" rx="4" fill="#0a0a0c" stroke={selectedComp === 'storage' ? '#FF5722' : '#333'} />
                      <text x="160" y="188" className="text-[7px] font-mono fill-zinc-500 font-extrabold">SATA GRID</text>
                    </g>
                  </svg>

                  {/* ACTIVE COMPONENT POPUP DOT */}
                  <div className="absolute bottom-2 left-3 bg-black/80 border border-zinc-900 rounded px-2 py-0.5 text-[9px] font-mono text-zinc-400">
                    {lang === 'id' ? 'Klik area komponen untuk inspeksi mendalam' : 'Click chassis areas to inspect specific hardware'}
                  </div>
                </div>
              )}
            </div>

            {/* PERFORMANCE PRESET CONTROLLERS */}
            {powerState === 'on' && (
              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-zinc-900/60 pt-4">
                
                {/* ACTIVE FAN SPEEDS PRESENTS */}
                <div className="space-y-2">
                  <span className="text-[9px] text-[#00E5FF] font-bold font-mono uppercase tracking-widest flex items-center gap-1">
                    <Wind size={11} className="animate-spin" />
                    {lang === 'id' ? 'KONTROL DESIBEL KIPAS' : 'FAN SPEED TUNER'}
                  </span>
                  <div className="flex bg-black p-1 rounded-lg border border-zinc-900 gap-1 text-[10px] font-mono">
                    {(['silent', 'balanced', 'turbo'] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setFanSpeed(s)}
                        className={`flex-1 text-center py-1 rounded capitalize cursor-pointer transition-all ${
                          fanSpeed === s 
                            ? 'bg-[#FF5722] text-white font-extrabold shadow' 
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* LIGHTING SYNC MODULE */}
                <div className="space-y-2">
                  <span className="text-[9px] text-amber-500 font-bold font-mono uppercase tracking-widest flex items-center gap-1">
                    <Sparkles size={11} />
                    {lang === 'id' ? 'SINKRONISASI CAHAYA CHASSIS' : 'CHASSIS GLOW SYNC'}
                  </span>
                  <div className="flex bg-black p-1 rounded-lg border border-zinc-900 gap-1 text-[10px] font-mono">
                    {(['zen', 'titan', 'drift'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setRgbMode(m)}
                        className={`flex-1 text-center py-1 rounded capitalize cursor-pointer transition-all ${
                          rgbMode === m 
                            ? 'bg-[#00E5FF] text-black font-extrabold shadow' 
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {m === 'zen' ? 'Zen Red' : m === 'titan' ? 'Titan Aura' : 'Cosmic Flow'}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* SIMULATED WORKSTATION TELEMETRY GAUGE PANEL */}
          {powerState === 'on' && (
            <div className="bg-[#121214] border border-zinc-900 rounded-2xl p-4 font-mono space-y-3">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold flex items-center gap-1.5 border-b border-zinc-900 pb-2">
                <Activity size={12} className="text-[#FF5722]" />
                {lang === 'id' ? 'DIAGNOSTIK TELEMETRI SEKETIKA' : 'REAL-TIME HARDWARE TELEMETRY'}
              </span>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                
                {/* TEMP DIAL */}
                <div className="bg-black border border-zinc-900 p-2.5 rounded-lg space-y-1">
                  <span className="text-[8px] text-zinc-500 uppercase">Temp Core</span>
                  <div className="text-sm font-black text-white flex items-center justify-center gap-0.5">
                    <Thermometer size={14} className="text-red-500" />
                    {tele.temp > 0 ? `${tele.temp}°C` : '--'}
                  </div>
                  <div className="text-[8px] text-zinc-600">
                    {fanSpeed === 'turbo' ? 'Frosty Mode' : fanSpeed === 'silent' ? 'Warm Silent' : 'Stable'}
                  </div>
                </div>

                {/* FAN RPM DIAL */}
                <div className="bg-black border border-zinc-900 p-2.5 rounded-lg space-y-1">
                  <span className="text-[8px] text-zinc-500 uppercase">Fan Velocity</span>
                  <div className="text-sm font-black text-[#00E5FF] flex items-center justify-center gap-0.5">
                    <Wind size={13} className="animate-spin" style={{ animationDuration: fanSpeed === 'turbo' ? '0.4s' : fanSpeed === 'silent' ? '2.0s' : '0.9s' }} />
                    {tele.rpm} RPM
                  </div>
                  <div className="text-[8px] text-zinc-600">35 Fans Sync</div>
                </div>

                {/* NOISE DECIBELS DIAL */}
                <div className="bg-black border border-zinc-900 p-2.5 rounded-lg space-y-1">
                  <span className="text-[8px] text-zinc-500 uppercase">Aero-Acoustics</span>
                  <div className="text-sm font-black text-amber-500">
                    {tele.noise} dB
                  </div>
                  <div className="text-[8px] text-zinc-600">
                    {fanSpeed === 'silent' ? 'Whisper Quiet' : fanSpeed === 'turbo' ? 'Extreme Exhaust' : 'Office Ambient'}
                  </div>
                </div>

                {/* VOLTAGE DIAL */}
                <div className="bg-black border border-zinc-900 p-2.5 rounded-lg space-y-1">
                  <span className="text-[8px] text-zinc-500 uppercase">Volt Draw</span>
                  <div className="text-sm font-black text-emerald-400">
                    {tele.voltage > 0 ? `${tele.voltage} V` : '--'}
                  </div>
                  <div className="text-[8px] text-zinc-600">Power Phase Sync</div>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* COLUMN 2 (7/12 width): HARDWARE SPECIFICATIONS INSPECTION TERMINAL */}
        <div className="xl:col-span-7 space-y-6">
          
          {/* COMPONENT SELECTOR BUTTONS GRID */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-3">
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-bold block mb-2 px-1">
              {lang === 'id' ? 'SELEKTOR SISTEM PERANGKAT KERAS' : 'HARDWARE NODE CONTROLLER'}
            </span>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-1 text-[10px] font-mono">
              {HARDWARE_DATA.map((h) => {
                const IconComp = h.icon;
                return (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => setSelectedComp(h.id)}
                    className={`p-2 rounded-lg border text-left cursor-pointer transition-all flex flex-col justify-between h-14 ${
                      selectedComp === h.id 
                        ? 'bg-[#FF5722]/10 text-[#FF5722] border-[#FF5722]/40 shadow-sm' 
                        : 'bg-black text-zinc-400 border-zinc-900 hover:bg-zinc-900/60'
                    }`}
                  >
                    <IconComp size={14} className={selectedComp === h.id ? 'text-[#FF5722]' : 'text-zinc-500'} />
                    <span className="font-extrabold truncate text-[9px] mt-1">{h.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* INSPECTOR DETAILS TERMINAL CARD */}
          <div className="bg-black/80 border border-zinc-900 rounded-2xl p-6 font-mono relative overflow-hidden space-y-6 min-h-[460px]">
            
            {/* TERMINAL BACKGROUND DESIGN LINES */}
            <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none select-none">
              <Cpu size={240} className="text-zinc-100" />
            </div>

            {/* HEADER METRICS */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-zinc-900 pb-4 gap-3">
              <div>
                <span className="text-[9px] text-[#00E5FF] font-bold uppercase tracking-widest bg-[#00E5FF]/10 px-2 py-0.5 rounded border border-[#00E5FF]/20">
                  {activeCompData.category}
                </span>
                <h3 className="text-base font-black text-white uppercase mt-1.5 flex items-center gap-1.5">
                  {activeCompData.specs[lang].title}
                </h3>
                <p className="text-[10px] text-zinc-500 mt-0.5 font-bold">
                  {activeCompData.specs[lang].brand}
                </p>
              </div>

              {/* LIVE VALUE COUNTER */}
              {powerState === 'on' && activeCompData.telemetry.loadBase > 0 && (
                <div className="bg-zinc-950 border border-zinc-900 px-3 py-2 rounded-xl text-right">
                  <span className="text-[8px] text-zinc-500 uppercase block">{activeCompData.telemetry.loadName}</span>
                  <span className="text-base font-black text-[#FF5722]">
                    {tele.load}{activeCompData.telemetry.loadUnit}
                  </span>
                </div>
              )}
            </div>

            {/* DESCRIPTION */}
            <div className="space-y-2">
              <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-extrabold block">Brief Engineering Deskripsi:</span>
              <p className="text-xs text-zinc-300 leading-relaxed text-justify bg-zinc-950/40 p-3.5 rounded-xl border border-zinc-900/60">
                {activeCompData.specs[lang].desc}
              </p>
            </div>

            {/* SPECIFICATION TREE LIST */}
            <div className="space-y-3">
              <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-extrabold block">Spesifikasi Detail (Bilingual Specs):</span>
              <ul className="space-y-1.5 text-xs">
                {activeCompData.specs[lang].details.map((d, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-zinc-400">
                    <span className="text-[#00E5FF] font-black shrink-0">▪</span>
                    <span className="leading-normal">{d}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* INTERACTIVE COMPONENT METRICS CHARTS */}
            {powerState === 'on' && (
              <div className="border-t border-zinc-900/60 pt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* PROGRESS Health index */}
                <div className="bg-zinc-950/40 border border-zinc-900 p-3 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-zinc-500 uppercase font-bold">{lang === 'id' ? 'Indeks Kesehatan' : 'Component Health Index'}</span>
                    <span className="text-emerald-400 font-bold">{tele.health}%</span>
                  </div>
                  <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                    <motion.div 
                      className="bg-emerald-400 h-full" 
                      initial={{ width: 0 }}
                      animate={{ width: `${tele.health}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                  <p className="text-[9px] text-zinc-600">Perfect stable operating thermal envelope.</p>
                </div>

                {/* POWER AND CLOCK EFFICIENCY */}
                <div className="bg-zinc-950/40 border border-zinc-900 p-3 rounded-xl space-y-1 text-[10px]">
                  <span className="text-zinc-500 uppercase font-bold block">{lang === 'id' ? 'Status Efisiensi' : 'Electrical Efficiency Status'}</span>
                  <div className="flex justify-between mt-1 text-zinc-400 font-mono">
                    <span>Volt Margin</span>
                    <span className="text-white">{tele.voltage > 0 ? `${tele.voltage}V` : '0V'}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400 font-mono">
                    <span>Performance Mode</span>
                    <span className="text-amber-500 uppercase font-bold">{fanSpeed === 'turbo' ? 'Overclocked' : fanSpeed === 'silent' ? 'ECO-Mode' : 'Standard'}</span>
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>

      </div>

      {/* COMPREHENSIVE INTERACTIVE MAINTENANCE CHECKLIST */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 font-mono space-y-4">
        
        {/* HEADER BAR */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-zinc-900 pb-4 gap-4">
          <div className="space-y-1">
            <span className="text-[9px] text-[#00E5FF] font-bold uppercase tracking-widest flex items-center gap-1">
              <CheckCircle size={11} className="text-emerald-400" />
              {lang === 'id' ? 'PROTOKOL PERAWATAN FISIK PC' : 'HARDWARE MAINTENANCE PROTOCOL'}
            </span>
            <h3 className="text-sm font-bold text-white uppercase">
              {lang === 'id' ? 'DAFTAR PERIKSA KESIAPAN STRUKTUR PENDINGIN' : 'COOLING LOOP PREVENTATIVE MAINTENANCE'}
            </h3>
            <p className="text-xs text-zinc-500">
              {lang === 'id'
                ? 'Lakukan verifikasi berkala terhadap sirkuit akrilik Hydro X dan UPS baterai cadangan.'
                : 'Perform routine physical checks of the acrylic custom loop fluid levels and active UPS backup cells.'}
            </p>
          </div>

          {/* READINESS INDEX BADGE */}
          <div className="bg-black border border-zinc-900 rounded-xl px-4 py-2 text-right shrink-0">
            <span className="text-[8px] text-zinc-500 uppercase block">{lang === 'id' ? 'Indeks Kesiapan Rig' : 'Rig Readiness Score'}</span>
            <span className="text-lg font-black text-[#00E5FF]">
              {readinessPercentage}%
            </span>
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] text-zinc-500 uppercase">
            <span>Rig Integrity Threshold</span>
            <span>{readinessPercentage >= 80 ? 'EXCELLENT STABLE' : readinessPercentage >= 50 ? 'STABLE' : 'RISK DETECTED'}</span>
          </div>
          <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
            <motion.div 
              className={`h-full transition-all duration-500 ${
                readinessPercentage >= 80 
                  ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' 
                  : readinessPercentage >= 50 
                    ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]' 
                    : 'bg-red-500'
              }`}
              style={{ width: `${readinessPercentage}%` }}
            />
          </div>
        </div>

        {/* INTERACTIVE CHECKLIST MATRIX */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 pt-2 text-xs">
          {tasks.map((t) => (
            <div 
              key={t.id}
              onClick={() => handleToggleTask(t.id)}
              className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                t.done 
                  ? 'bg-emerald-950/10 border-emerald-900/40 text-zinc-300' 
                  : 'bg-black border-zinc-900 hover:border-zinc-800 text-zinc-500'
              }`}
            >
              <div className={`w-4 h-4 rounded border flex items-center justify-center mt-0.5 shrink-0 transition-all ${
                t.done 
                  ? 'bg-emerald-500 border-emerald-400 text-black' 
                  : 'border-zinc-800 bg-zinc-900'
              }`}>
                {t.done && <span className="text-[10px] font-black leading-none">✓</span>}
              </div>
              <div className="space-y-0.5">
                <span className={`font-bold block ${t.done ? 'text-zinc-200 line-through opacity-75' : 'text-zinc-300'}`}>
                  {lang === 'id' ? t.idLabel : t.enLabel}
                </span>
                <span className="text-[9px] text-zinc-500 uppercase block font-bold">
                  {t.done ? (lang === 'id' ? 'Selesai diverifikasi' : 'Verified nominal') : (lang === 'id' ? 'Menunggu peninjauan' : 'Awaiting inspection')}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* BILINGUAL COMPREHENSIVE TEXTBOOK COMPLEMENT (100x COMPREHENSIVE BONUS MANUAL FOR RIG BUILD) */}
      <div className="bg-[#141416] border border-zinc-900 rounded-2xl p-6 font-mono space-y-4 leading-relaxed">
        <h3 className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b border-zinc-900 pb-3">
          <Info size={14} className="text-[#FF5722]" />
          {lang === 'id' ? 'BUKU PANDUAN PELENGKAP: KOMPETENSI TEKNIK TITANCORE CHAMBER v2' : 'COMPREHENSIVE GUIDE: TITANCORE CHAMBER v2 PHYSICAL ARCHITECTURE'}
        </h3>
        
        {lang === 'id' ? (
          <div className="space-y-4 text-xs text-zinc-400 text-justify">
            <p>
              <strong>1. Konsep Desain & Lingkungan Operasional:</strong> Workstation <em>TitanCore Chamber v2</em> dirancang oleh Administrator sebagai pusat komputasi berkinerja tinggi yang diletakkan di ruang kendali utama. Dibangun menggunakan sasis raksasa Corsair 9000D Super Tower, workstation ini memiliki berat melebihi 45 kg setelah seluruh sistem pendingin cairan diisi penuh dengan coolant khusus. Tujuan utamanya adalah mengeksekusi visualisasi grid volumetrik 3D, simulasi patahan sesar aktif, pemodelan inversi akustik seismik, serta meng-host swarm multi-agent kecerdasan buatan lokal tanpa bergantung pada konektivitas cloud eksternal.
            </p>
            <p>
              <strong>2. Rekayasa Aliran Pendingin & Aerodinamis:</strong> Mengingat daya puncak sistem gabungan CPU AMD Ryzen 9 9950X3D dan Dual GPU RTX 5090 dapat menyentuh 1600 Watt, sistem kustom loop pendingin dirancang secara modular dengan aliran ganda (dual-loop setup). Tiga radiator tebal Corsair XR7 480mm tembaga dipasang untuk memaksimalkan pembuangan panas laten cairan akrilik. Aliran udara dikawal oleh total 35 kipas, di mana dinding radiator atas dilapisi tri-layer push-pull-pull Noctua industrialPPC-3000 RPM guna menjamin tekanan statis udara menembus tumpukan sirip logam radiator secara mutlak bahkan di suhu lingkungan ruangan tinggi.
            </p>
            <p>
              <strong>3. Integritas Kelistrikan & UPS Proteksi:</strong> Guna mengamankan data pemboran bernilai tinggi dari risiko korupsi file akibat mati lampu instan (sudden blackouts) di rig pengeboran terpencil, sistem kelistrikan TitanCore dilindungi oleh APC Smart-UPS 3000VA dengan modul baterai eksternal tambahan. Jika jaringan listrik genset rig mati total, UPS mendeteksi pemutusan arus dalam waktu kurang dari 4 milidetik, mengalihkan sumber listrik ke baterai, serta mengirimkan instruksi shutdown darurat otomatis yang aman ke server backend setelah menulis sisa telemetri pemboran ke media penyimpanan solid-state Speed Tier yang terenkripsi.
            </p>
          </div>
        ) : (
          <div className="space-y-4 text-xs text-zinc-400 text-justify">
            <p>
              <strong>1. Design Concept & Operational Environment:</strong> The <em>TitanCore Chamber v2</em> developer workstation is conceptualized by Administrator as an extreme computing sanctuary stationed directly inside the command room. Formed around the monumental Corsair 9000D Super Tower, the custom workstation weighs over 45 kilograms when fully saturated with non-conductive glycol cooling fluids. Its core objective is executing 3D voxel grid deformation models, active fault seismic inversions, and localized LLM swarm AI debates locally without relying on external cloud latencies or public APIs.
            </p>
            <p>
              <strong>2. Cooling Loop Engineering & Aero-Acoustics:</strong> Considering that the peak electrical power of the paired Zen 5 CPU and dual RTX 5090 Blackwell cards can cross 1600 Watts under full artificial neural network training, the loop is custom-welded with premium 14mm acrylic hard tubes. Three massive Corsair XR7 480mm thick copper radiators coordinate heat dissipation. 35 high-static pressure fans guide airflows. The top radiator array is layered with a brutal tri-layer push-pull-pull fan configuration using Noctua industrialPPC 3000 RPM fans, achieving immense structural air penetration through metallic radiator fins.
            </p>
            <p>
              <strong>3. Power Delivery & Transient Protection:</strong> To shield high-stakes live drilling data arrays from sudden power brownouts or lightning surges at remote onshore rigs, the power lines route through an APC Smart-UPS 3000VA backed by external hot-swappable battery pods. The system transfers power to battery reserves in under 4 milliseconds of grid drop, giving localized scripts enough buffer (~35 minutes) to securely serialize borehole telemetry records to the speed-tiered RAID array before dispatching automated alert payloads to support teams.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
