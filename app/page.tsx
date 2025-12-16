
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { MessageSquare, Server, ArrowRight, LayoutGrid } from "lucide-react";

export default function ServiceDirectoryPage() {
  const services = [
    {
      title: "企业微信",
      description: "管理企业微信群组、配置和自动化任务。",
      icon: MessageSquare,
      href: "/wxwork/group",
      color: "decoration-green-500/30",
      iconColor: "text-green-500",
      gradient: "from-green-500/10 to-transparent"
    },
    {
      title: "虚拟机管理",
      description: "创建、监控和管理云端虚拟化资源。",
      icon: Server,
      href: "/resources/virtualization",
      color: "decoration-blue-500/30",
      iconColor: "text-blue-500",
      gradient: "from-blue-500/10 to-transparent"
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[100px]" />
      </div>

      {/* Navbar */}
      <header className="px-6 h-16 flex items-center justify-between border-b bg-background/60 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-xl">
          <LayoutGrid className="size-6 text-primary" />
          <span>{siteConfig.name}</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/auth/login">
            <Button variant="ghost">登录</Button>
          </Link>
          <Link href="/dashboard">
            <Button>控制台</Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-16 flex flex-col items-center">
        <div className="text-center max-w-2xl mb-16 space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            服务目录
          </h1>
          <p className="text-lg text-muted-foreground">
            快速访问 {siteConfig.name} 的核心服务与工具
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
          {services.map((service) => (
            <Link
              key={service.href}
              href={service.href}
              className="group relative overflow-hidden rounded-2xl border bg-card/50 hover:bg-card/80 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              <div className="p-6 relative z-10 flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-background border shadow-sm ${service.iconColor}`}>
                    <service.icon className="size-6" />
                  </div>
                  <ArrowRight className="size-5 text-muted-foreground group-hover:text-primary transition-colors -rotate-45 group-hover:rotate-0 duration-300" />
                </div>

                <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                <p className="text-muted-foreground text-sm flex-1">
                  {service.description}
                </p>
              </div>
            </Link>
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
