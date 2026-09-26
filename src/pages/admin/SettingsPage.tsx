import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useTheme } from "@/lib/theme/ThemeContext";
import { PageHeader } from "@/components/admin/AdminShared";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  Globe,
  Palette,
  Server,
  Save,
  CheckCircle2,
  Database,
  ShieldCheck,
} from "lucide-react";

export default function SettingsPage() {
  const { t, lang, setLang, isRTL } = useLanguage();
  const { theme, setTheme } = useTheme();

  const [repoName, setRepoName] = useState("DRP — Digital Research Portal");
  const [repoDesc, setRepoDesc] = useState(
    "Central institutional repository for academic and Islamic graduate theses, dissertations, and research archives."
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const isDemo =
    import.meta.env.VITE_USE_MOCK_DATA === "true" ||
    import.meta.env.DEV ||
    !import.meta.env.VITE_API_URL;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("settings.title")}
        description="Configure repository metadata, language preferences, appearance, and system parameters."
        actions={
          <Button onClick={handleSave} className="gap-2 shadow-xs">
            {savedSuccess ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{savedSuccess ? t("settings.savedSuccess") : t("common.save")}</span>
          </Button>
        }
      />

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid grid-cols-4 max-w-xl h-10 p-1 bg-muted/60 border border-border/60">
          <TabsTrigger value="general" className="gap-1.5 text-xs">
            <Settings className="h-3.5 w-3.5" />
            <span>{t("settings.general")}</span>
          </TabsTrigger>
          <TabsTrigger value="language" className="gap-1.5 text-xs">
            <Globe className="h-3.5 w-3.5" />
            <span>{t("settings.language")}</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-1.5 text-xs">
            <Palette className="h-3.5 w-3.5" />
            <span>{t("settings.appearance")}</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="gap-1.5 text-xs">
            <Server className="h-3.5 w-3.5" />
            <span>{t("settings.system")}</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="mt-6 space-y-6">
          <Card className="border border-border/80 shadow-xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-heading">
                {t("settings.repositoryName")}
              </CardTitle>
              <CardDescription>
                Public identity displayed across search engines, citations, and public thesis viewers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="repoName">{t("settings.repositoryName")}</Label>
                <Input
                  id="repoName"
                  value={repoName}
                  onChange={(e) => setRepoName(e.target.value)}
                  className="max-w-lg"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="repoDesc">{t("settings.repositoryDescription")}</Label>
                <textarea
                  id="repoDesc"
                  rows={3}
                  value={repoDesc}
                  onChange={(e) => setRepoDesc(e.target.value)}
                  className="flex w-full max-w-lg rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Language & Direction Settings */}
        <TabsContent value="language" className="mt-6 space-y-6">
          <Card className="border border-border/80 shadow-xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-heading">
                {t("settings.language")} & RTL
              </CardTitle>
              <CardDescription>
                Select administrative language. Right-to-Left (RTL) mode automatically aligns typography and layouts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t("settings.defaultLanguage")}</Label>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant={lang === "en" ? "default" : "outline"}
                    onClick={() => setLang("en")}
                    className="gap-2"
                  >
                    <span>English (LTR)</span>
                  </Button>
                  <Button
                    type="button"
                    variant={lang === "ar" ? "default" : "outline"}
                    onClick={() => setLang("ar")}
                    className="gap-2 font-arabic"
                  >
                    <span>العربية (RTL)</span>
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border border-border/70 bg-muted/30 p-4 text-xs space-y-1 text-muted-foreground">
                <p className="font-semibold text-foreground">Current Direction Status:</p>
                <p>Direction: <bdi className="font-mono">{isRTL ? "rtl" : "ltr"}</bdi></p>
                <p>Active Code: <bdi className="font-mono">{lang}</bdi></p>
                <p>Bilingual isolation is applied to all IDs, DOIs, and citations.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="mt-6 space-y-6">
          <Card className="border border-border/80 shadow-xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-heading">
                {t("settings.appearance")}
              </CardTitle>
              <CardDescription>
                Select platform color scheme and contrast preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Platform Theme</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-md">
                  <button
                    type="button"
                    onClick={() => setTheme("light")}
                    className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-xs font-medium transition-all ${
                      theme === "light"
                        ? "border-primary bg-primary/5 text-primary shadow-xs"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <div className="h-6 w-12 rounded bg-amber-50 border border-amber-200" />
                    <span>{t("settings.themeLight")}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme("dark")}
                    className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-xs font-medium transition-all ${
                      theme === "dark"
                        ? "border-primary bg-primary/5 text-primary shadow-xs"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <div className="h-6 w-12 rounded bg-slate-900 border border-slate-700" />
                    <span>{t("settings.themeDark")}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme("system")}
                    className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-xs font-medium transition-all ${
                      theme === "system"
                        ? "border-primary bg-primary/5 text-primary shadow-xs"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <div className="h-6 w-12 rounded bg-gradient-to-r from-amber-50 to-slate-900 border border-border" />
                    <span>{t("settings.themeSystem")}</span>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System & Architecture */}
        <TabsContent value="system" className="mt-6 space-y-6">
          <Card className="border border-border/80 shadow-xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-heading">
                {t("settings.system")} & API Status
              </CardTitle>
              <CardDescription>
                Runtime configuration, backend connectivity, and data source mode.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="rounded-lg border border-border/80 p-3.5 space-y-1 bg-card">
                  <span className="text-muted-foreground font-medium">Frontend Version</span>
                  <p className="font-semibold text-foreground font-mono">v1.2.0 (Prompt 2)</p>
                </div>

                <div className="rounded-lg border border-border/80 p-3.5 space-y-1 bg-card">
                  <span className="text-muted-foreground font-medium">API Target URL</span>
                  <p className="font-semibold text-foreground font-mono truncate">
                    {import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api"}
                  </p>
                </div>

                <div className="rounded-lg border border-border/80 p-3.5 space-y-1 bg-card">
                  <span className="text-muted-foreground font-medium">Data Pipeline Mode</span>
                  <div className="flex items-center gap-1.5 font-semibold text-foreground">
                    {isDemo ? (
                      <>
                        <Database className="h-3.5 w-3.5 text-amber-500" />
                        <span>Mock / Demo Mode (drp-mock-data)</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                        <span>Production Django REST API</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="rounded-lg border border-border/80 p-3.5 space-y-1 bg-card">
                  <span className="text-muted-foreground font-medium">Authentication</span>
                  <p className="font-semibold text-foreground font-mono">JWT Bearer Interceptor</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
