"use client";

import { useState } from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { toast } from "sonner";
import { motion } from "motion/react";
import {
  ArrowRight,
  LayoutGrid,
  Globe,
  Server,
  HardDrive,
  Database,
  ShieldCheck,
  Package,
  FileCheck,
} from "lucide-react";

const iconColors = [
  "text-blue-500",
  "text-green-500",
  "text-purple-500",
  "text-orange-500",
  "text-red-500",
  "text-cyan-500",
  "text-pink-500",
  "text-yellow-500",
];

const gradients = [
  "from-blue-500/10 to-transparent",
  "from-green-500/10 to-transparent",
  "from-purple-500/10 to-transparent",
  "from-orange-500/10 to-transparent",
  "from-red-500/10 to-transparent",
  "from-cyan-500/10 to-transparent",
  "from-pink-500/10 to-transparent",
  "from-yellow-500/10 to-transparent",
];

type ServiceType = {
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href: string;
  iconColor: string;
  gradient: string;
  implemented: boolean;
  bgChar: string;
};

interface ServiceCardProps {
  service: ServiceType;
  onServiceClick: (e: React.MouseEvent<HTMLAnchorElement>, service: ServiceType) => void;
}

function ServiceCard({ service, onServiceClick }: ServiceCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl border backdrop-blur-sm"
      initial={{ y: 0, opacity: 0.6 }}
      animate={{
        y: isHovered ? -4 : 0,
        opacity: isHovered ? 0.9 : 0.6,
        transition: {
          duration: 0.3,
          ease: "easeInOut",
        },
      }}
      style={{
        backgroundColor: "hsl(var(--card))",
        boxShadow: isHovered
          ? "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
          : "none",
      }}
    >
      <Link
        href={service.href}
        onClick={(e) => onServiceClick(e, service)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="block h-full"
      >
        {/* Background gradient */}
        <motion.div
          className={`absolute inset-0 bg-linear-to-br ${service.gradient}`}
          initial={{ opacity: 0 }}
          animate={{
            opacity: isHovered ? 1 : 0,
            transition: {
              duration: 0.5,
              ease: "easeInOut",
            },
          }}
        />

        {/* Background character decoration */}
        <motion.div
          className={`absolute -right-4 -bottom-4 text-[100px] md:text-[120px] font-black leading-none ${service.iconColor} select-none pointer-events-none`}
          initial={{ opacity: 0.04, scale: 1, y: 0, rotate: 0 }}
          animate={isHovered ? {
            opacity: 0.08,
            scale: 1.05,
            y: -12,
            rotate: 3,
            transition: {
              duration: 0.3,
              ease: "easeInOut",
            },
          } : {
            opacity: 0.04,
            scale: 1,
            y: [0, -8, 0],
            rotate: [0, 1, 0],
            transition: {
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        >
          {service.bgChar}
        </motion.div>

        {/* Content */}
        <div className="p-6 relative z-10 flex flex-col h-full min-h-[160px]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 flex-1">
              <motion.div
                className={`p-3 rounded-xl bg-background/80 backdrop-blur-sm border shadow-sm ${service.iconColor} shrink-0`}
                whileHover={{
                  scale: 1.1,
                  transition: {
                    duration: 0.3,
                    ease: "easeInOut",
                  },
                }}
              >
                <service.icon className="size-6" />
              </motion.div>
              <motion.h3
                className="text-lg font-semibold flex-1"
                animate={{
                  color: isHovered ? "hsl(var(--primary))" : "hsl(var(--foreground))",
                  transition: {
                    duration: 0.3,
                    ease: "easeInOut",
                  },
                }}
              >
                {service.title}
              </motion.h3>
            </div>
            <motion.div
              className="shrink-0 ml-2"
              initial={{ rotate: -45, x: 0 }}
              animate={{
                rotate: isHovered ? 0 : -45,
                x: isHovered ? 4 : 0,
                color: isHovered ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                transition: {
                  duration: 0.3,
                  ease: "easeInOut",
                },
              }}
            >
              <ArrowRight className="size-5" />
            </motion.div>
          </div>

          <p className="text-muted-foreground text-sm flex-1 leading-relaxed">
            {service.description}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}

export default function ServiceDirectoryPage() {
  const services = [
    {
      title: "虚拟机",
      description: "通过混合云管理平台进行虚拟机申请和管理",
      icon: Server,
      href: "/resources/virtualization",
      iconColor: iconColors[1],
      gradient: gradients[1],
      implemented: true,
      bgChar: "VM",
    },
    {
      title: "域名解析",
      description: "内、外网DNS域名解析记录自助申请，外网解析需安全部评估",
      icon: Globe,
      href: "/services/dns",
      iconColor: iconColors[0],
      gradient: gradients[0],
      implemented: false,
      bgChar: "DNS",
    },
    {
      title: "堡垒机主机授权",
      description: "堡垒机访问授权服务，支持SSH及RDP协议代理访问",
      icon: ShieldCheck,
      href: "/services/bastion-authorization",
      iconColor: iconColors[1],
      gradient: gradients[1],
      implemented: false,
      bgChar: "BASTION",
    },
    {
      title: "制品仓库授权",
      description: "Artifactory制品仓库账户授权服务",
      icon: Package,
      href: "/services/artifact-repo",
      iconColor: iconColors[3],
      gradient: gradients[3],
      implemented: false,
      bgChar: "ARTIFACT",
    },
    {
      title: "存储",
      description: "对象存储(S3)和文件存储(CIFS/NFS)自助申请服务",
      icon: HardDrive,
      href: "/services/storage",
      iconColor: iconColors[5],
      gradient: gradients[5],
      implemented: false,
      bgChar: "STORAGE",
    },
    {
      title: "数据库堡垒机注册",
      description: "数据库堡垒机自助注册，支持MySQL/Oracle/PostgreSQL/Redis协议",
      icon: Database,
      href: "/services/db-bastion-register",
      iconColor: iconColors[5],
      gradient: gradients[5],
      implemented: false,
      bgChar: "DB",
    },
    {
      title: "数据库堡垒机授权",
      description: "数据库堡垒机访问授权，支持MySQL/Oracle/PostgreSQL/Redis协议",
      icon: ShieldCheck,
      href: "/services/db-bastion-authorization",
      iconColor: iconColors[6],
      gradient: gradients[6],
      implemented: false,
      bgChar: "DBAUTH",
    },
    {
      title: "证书管理",
      description: "SSL/TLS证书申请、续期和管理服务",
      icon: FileCheck,
      href: "/services/certificate-management",
      iconColor: iconColors[7],
      gradient: gradients[7],
      implemented: false,
      bgChar: "CERT",
    },
  ];

  const handleServiceClick = (e: React.MouseEvent<HTMLAnchorElement>, service: ServiceType) => {
    if (!service.implemented) {
      e.preventDefault();
      toast.info("正在开发中", {
        description: `${service.title}功能正在开发中，敬请期待`,
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <motion.div
          className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-[100px]"
          animate={{
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[100px]"
          animate={{
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-purple-500/3 blur-[120px]"
          animate={{
            opacity: [0.2, 0.3, 0.2],
            scale: [1, 1.03, 1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Navbar */}
      <header className="px-6 h-16 flex items-center justify-between border-b bg-background/60 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-xl">
          <LayoutGrid className="size-6 text-primary" />
          <span>{siteConfig.name}</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-10 flex flex-col items-center">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl">
          {services.map((service) => (
            <ServiceCard
              key={service.href}
              service={service}
              onServiceClick={handleServiceClick}
            />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-muted-foreground border-t bg-background/50">
        © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
      </footer>
    </div>
  );
}
