import React, { useState } from 'react';
import {
  Copy,
  Check,
  Download,
  FileCode,
  Folder,
  ShieldCheck,
  Terminal,
  Cloud,
  Laptop,
  FolderTree,
  ExternalLink,
  Sparkles,
  Play,
  ArrowRight,
  Package,
  Layers,
  Cpu,
  CheckCircle2,
  FileText
} from 'lucide-react';
import JSZip from 'jszip';
import { ANDROID_PROJECT_FILES, AndroidFile } from '../data/androidProjectFiles';
import { Language } from '../types/store';
import { getTranslation } from '../data/translations';

interface AndroidCodeViewerProps {
  language: Language;
}

type ActiveTab = 'guide-cloud' | 'guide-studio' | 'files' | 'tree';

export const AndroidCodeViewer: React.FC<AndroidCodeViewerProps> = ({ language }) => {
  const t = getTranslation(language);
  const isAr = language === 'ar';

  const [activeTab, setActiveTab] = useState<ActiveTab>('guide-cloud');
  const [selectedFile, setSelectedFile] = useState<AndroidFile>(ANDROID_PROJECT_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isZipping, setIsZipping] = useState(false);
  const [zipSuccess, setZipSuccess] = useState(false);

  const categories = [
    { id: 'all', label: isAr ? 'جميع الملفات' : 'All Files' },
    { id: 'compose', label: isAr ? 'واجهات Compose UI' : 'Compose UI' },
    { id: 'gradle', label: isAr ? 'بناء Gradle' : 'Gradle Build' },
    { id: 'workflow', label: isAr ? 'السحاب CI/CD' : 'Cloud CI/CD' },
    { id: 'manifest', label: isAr ? 'المانيفست' : 'Manifest' },
    { id: 'config', label: isAr ? 'الإعدادات' : 'Config' },
  ];

  const filteredFiles = ANDROID_PROJECT_FILES.filter((file) => {
    if (selectedCategory === 'all') return true;
    return file.category === selectedCategory;
  });

  const handleCopyCode = (codeText?: string) => {
    navigator.clipboard.writeText(codeText || selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([selectedFile.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 1-Click ZIP Downloader: creates a complete, ready-to-build Android Studio project archive
  const handleDownloadFullProjectZip = async () => {
    try {
      setIsZipping(true);
      setZipSuccess(false);

      const zip = new JSZip();

      // 1. Add all project files into their relative folders
      ANDROID_PROJECT_FILES.forEach((file) => {
        zip.file(file.path, file.code);
      });

      // 2. Add standard gradlew executable scripts
      const gradlewScript = `#!/usr/bin/env sh
# Gradle wrapper script for ChahnDz Android App
exec gradle "\$@"
`;
      const gradlewBatScript = `@rem Gradle wrapper script for Windows
@gradle %*
`;
      zip.file('gradlew', gradlewScript, { unixPermissions: '755' });
      zip.file('gradlew.bat', gradlewBatScript);

      // 3. Add root README.md
      const readmeContent = `# تطبيق اشحنلي عبود (ChahnDz Store) - Android App
مشروع أندرويد حقيقي متكامل مبني باستخدام:
- Jetpack Compose + Material 3
- Firebase Authentication & Firestore (RBAC taybawi8@gmail.com)
- دعم الشحن السريع بالدينار الجزائري والدولار (BaridiMob & CCP)
- دعم الإعلانات Google AdMob (Banner & Interstitial)
- الوضع الليلي والوضع الفاتح (Dynamic Dark / Light Theme)
- التحقق المباشر من أسماء اللاعبين (Player ID Verification)

## خيارات البناء وتوليد ملف APK:

### 1. عبر GitHub Actions سحابياً (بدون الحاجة لجهاز حاسوب قوي):
1. ارفع محتويات هذا المجلد إلى مستودع جديد على GitHub.
2. توجه لتبويب **Actions** في صفحة المستودع.
3. ستجد سير العمل **Build Android APK (ChahnDz Store)** جاهزاً ومفعلاً.
4. انتظر 3 دقائق حتى يكتمل البناء، ثم حمّل ملف الـ APK المسمى **ChahnDz-Debug-APK**.

### 2. عبر Android Studio على الحاسوب:
1. افتح برنامج Android Studio.
2. اختر **Open** ثم حدد مجلد المشروع.
3. انتظر انتهاء مزامنة Gradle (Sync Project with Gradle Files).
4. من القائمة العلوية اضغط: **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
5. ستجد ملف الـ APK جاهزاً في: \`app/build/outputs/apk/debug/app-debug.apk\`.
`;
      zip.file('README.md', readmeContent);

      // Generate the zip blob
      const content = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = URL.createObjectURL(content);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.href = downloadUrl;
      downloadAnchor.download = 'ChahnDz-Android-JetpackCompose-Project.zip';
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);
      URL.revokeObjectURL(downloadUrl);

      setIsZipping(false);
      setZipSuccess(true);
      setTimeout(() => setZipSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to bundle project ZIP:', err);
      setIsZipping(false);
    }
  };

  return (
    <div className="p-3 sm:p-5 space-y-5">
      {/* Hero Header Banner with 1-Click ZIP Download */}
      <div className="bg-gradient-to-br from-[#0F1629] via-[#0B0F1D] to-[#07090F] rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-lg shadow-amber-500/10">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  {isAr ? 'مركز تصدير وبناء تطبيق أندرويد (APK Builder)' : 'Android APK Export & Build Studio'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  Jetpack Compose
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {isAr
                  ? 'جميع ملفات مشروع الأندرويد جاهزة بكافة حزم Gradle و Kotlin لتعمل مباشرة على Android Studio، أو لتوليد ملف APK جاهز للتثبيت على هاتفك سحابياً مجاناً عبر GitHub Actions.'
                  : 'Complete Android Studio project with modern Gradle scripts, Jetpack Compose, and automated Cloud CI/CD APK generation workflow.'}
              </p>
            </div>
          </div>

          {/* Primary Action: One-Click ZIP Download */}
          <button
            onClick={handleDownloadFullProjectZip}
            disabled={isZipping}
            className="w-full md:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all shrink-0 cursor-pointer disabled:opacity-70"
          >
            {isZipping ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>{isAr ? 'جارِ تجميع وضغط ملفات المشروع...' : 'Packaging Project ZIP...'}</span>
              </>
            ) : zipSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-black" />
                <span>{isAr ? 'تم تحميل ملف المشروع بالكامل بنجاح!' : 'Project Downloaded!'}</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-black" />
                <span>{isAr ? 'تحميل المشروع كاملاً (.ZIP جاهز)' : 'Download Full Project (.ZIP)'}</span>
              </>
            )}
          </button>
        </div>

        {/* Feature Tags */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80">
          <div className="bg-[#080C16] p-2.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-[10px] text-slate-500 block font-bold">1. لغة الواجهات</span>
            <span className="font-bold text-amber-400 text-[11px]">Jetpack Compose M3</span>
          </div>
          <div className="bg-[#080C16] p-2.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-[10px] text-slate-500 block font-bold">2. توليد APK السحابي</span>
            <span className="font-bold text-cyan-400 text-[11px]">GitHub Actions CI/CD</span>
          </div>
          <div className="bg-[#080C16] p-2.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-[10px] text-slate-500 block font-bold">3. مظهر التطبيق</span>
            <span className="font-bold text-emerald-400 text-[11px]">ليلي / فاتح / نظام تلقائي</span>
          </div>
          <div className="bg-[#080C16] p-2.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-[10px] text-slate-500 block font-bold">4. فحص المعرفات</span>
            <span className="font-bold text-purple-400 text-[11px]">تحقق فوري من اسم اللاعب</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-[#0A0E1A] rounded-xl border border-slate-800 overflow-x-auto scrollbar-none text-xs">
        <button
          onClick={() => setActiveTab('guide-cloud')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'guide-cloud'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Cloud className="w-4 h-4" />
          <span>{isAr ? '1. توليد APK سحابياً (بدون حاسوب قوي)' : '1. Cloud APK (GitHub Actions)'}</span>
        </button>

        <button
          onClick={() => setActiveTab('guide-studio')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'guide-studio'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Laptop className="w-4 h-4" />
          <span>{isAr ? '2. فتح المشروع في Android Studio' : '2. Android Studio on PC'}</span>
        </button>

        <button
          onClick={() => setActiveTab('files')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'files'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>{isAr ? '3. مستكشف الأكواد والملفات' : '3. Project Code Explorer'}</span>
        </button>

        <button
          onClick={() => setActiveTab('tree')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'tree'
              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          <span>{isAr ? '4. الهيكل الشجري للمشروع' : '4. Project Directory Tree'}</span>
        </button>
      </div>

      {/* TAB 1: CLOUD APK GENERATOR (GITHUB ACTIONS) */}
      {activeTab === 'guide-cloud' && (
        <div className="space-y-4">
          <div className="bg-[#0B0F1D] rounded-2xl p-4 sm:p-5 border border-cyan-500/30 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-white">
                  {isAr ? 'طريقة توليد ملف APK مباشرة وسحابياً عبر GitHub Actions' : 'How to Build APK in the Cloud using GitHub Actions'}
                </h3>
                <p className="text-xs text-slate-400">
                  {isAr
                    ? 'الحل الأمثل في حال لم يكن لديك حاسوب قوي أو لا تملك Android Studio. سير العمل سيبني التطبيق مجاناً في 3 دقائق!'
                    : 'The fastest zero-config way to get an installable APK on your phone without installing Android Studio.'}
                </p>
              </div>
            </div>

            {/* 4 Steps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {/* Step 1 */}
              <div className="bg-[#070A14] p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-cyan-500 text-black font-black text-xs flex items-center justify-center">1</span>
                  <h4 className="font-bold text-white text-xs sm:text-sm">
                    {isAr ? 'تحميل ملف المشروع المضغوط (.ZIP)' : 'Download Project ZIP'}
                  </h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isAr
                    ? 'اضغط على زر "تحميل المشروع كاملاً" بالأعلى للحصول على حزمة ChahnDz-Android-JetpackCompose-Project.zip التي تحتوي على كافة ملفات Kotlin و Gradle وسير العمل.'
                    : 'Click "Download Full Project (.ZIP)" above to get the complete bundled project ready for Git.'}
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-[#070A14] p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-cyan-500 text-black font-black text-xs flex items-center justify-center">2</span>
                  <h4 className="font-bold text-white text-xs sm:text-sm">
                    {isAr ? 'إنشاء مستودع مجاني على GitHub' : 'Create GitHub Repository'}
                  </h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isAr
                    ? 'توجه إلى GitHub.com وأنشئ مستودعاً جديداً (Public أو Private) باسم ChahnDzStore، ثم ارفع ملفات المشروع بداخله (أو فك الضغط واعمل git push).'
                    : 'Create a new GitHub repository and push or upload the extracted files into the main branch.'}
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-[#070A14] p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-cyan-500 text-black font-black text-xs flex items-center justify-center">3</span>
                  <h4 className="font-bold text-white text-xs sm:text-sm">
                    {isAr ? 'بدء البناء التلقائي في السحاب' : 'Automatic Cloud Compilation'}
                  </h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isAr
                    ? 'بمجرد رفع الملفات، سيتعرف GitHub تلقائياً على ملف .github/workflows/build-apk.yml ويبدأ سير العمل في بناء ملف الـ APK باستخدام خوادم أوبونتو وحزمة جافا 17.'
                    : 'GitHub Actions will detect the build-apk.yml workflow and trigger Gradle build assembleDebug automatically.'}
                </p>
              </div>

              {/* Step 4 */}
              <div className="bg-[#070A14] p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-black font-black text-xs flex items-center justify-center">4</span>
                  <h4 className="font-bold text-white text-xs sm:text-sm">
                    {isAr ? 'تحميل ملف الـ APK وتثبيته على هاتفك!' : 'Download APK Artifact to Mobile'}
                  </h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isAr
                    ? 'توجه إلى تبويب Actions في GitHub > اضغط على آخر تشغيل للـ Workflow > وفي أسفل الصفحة تحت قسم Artifacts ستجد ملف ChahnDz-Debug-APK اضغط لتحميله وتثبيته فوراً!'
                    : 'Under the workflow run Artifacts section, download ChahnDz-Debug-APK.zip, extract the app-debug.apk and install it!'}
                </p>
              </div>
            </div>

            {/* Quick Git Commands helper */}
            <div className="p-3 bg-[#05070E] rounded-xl border border-slate-800 text-xs font-mono space-y-1.5">
              <span className="text-[11px] text-amber-400 font-bold block font-sans">
                {isAr ? 'أوامر سريعة لرفع المشروع من سطر الأوامر (Terminal):' : 'Terminal Commands to Push & Trigger Build:'}
              </span>
              <div className="text-slate-300 bg-black/60 p-2.5 rounded-lg border border-slate-800/80 overflow-x-auto space-y-1">
                <div>git init</div>
                <div>git add .</div>
                <div>git commit -m &quot;Initial commit: ChahnDz Jetpack Compose Store&quot;</div>
                <div>git branch -M main</div>
                <div>git remote add origin https://github.com/YOUR_USERNAME/ChahnDzStore.git</div>
                <div>git push -u origin main</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ANDROID STUDIO ON PC */}
      {activeTab === 'guide-studio' && (
        <div className="bg-[#0B0F1D] rounded-2xl p-4 sm:p-5 border border-amber-500/30 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white">
                {isAr ? 'خطوات فتح المشروع وتوليد الـ APK داخل Android Studio على الكمبيوتر' : 'Android Studio PC Setup & APK Export'}
              </h3>
              <p className="text-xs text-slate-400">
                {isAr
                  ? 'خطوات عملية واضحة لتشغيل التطبيق على المحاكي أو استخراج ملف APK نهائي جاهز للتوزيع.'
                  : 'Step-by-step instructions for opening the project and running it on emulator or physical device.'}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-[#070A14] border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-black font-black text-xs flex items-center justify-center">1</span>
                <span className="font-bold text-white text-xs sm:text-sm">
                  {isAr ? 'فك ضغط ملف المشروع' : 'Extract the Project ZIP'}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isAr
                  ? 'قم بفك ضغط ملف ChahnDz-Android-JetpackCompose-Project.zip في مجلد مناسب على حاسوبك (مثل: C:\\Projects\\ChahnDz).'
                  : 'Extract the downloaded ZIP into your projects directory.'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#070A14] border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-black font-black text-xs flex items-center justify-center">2</span>
                <span className="font-bold text-white text-xs sm:text-sm">
                  {isAr ? 'فتح المشروع في Android Studio' : 'Open Existing Project'}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isAr
                  ? 'شغّل Android Studio، واختر Open ثم حدد مجلد المشروع المفكوك. سيقوم البرنامج بقراءة ملف settings.gradle.kts وبناء الشجرة البرمجية.'
                  : 'Launch Android Studio, choose Open, and select the project folder.'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#070A14] border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-black font-black text-xs flex items-center justify-center">3</span>
                <span className="font-bold text-white text-xs sm:text-sm">
                  {isAr ? 'مزامنة Gradle مع المكتبات (Sync Now)' : 'Sync Project with Gradle'}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isAr
                  ? 'اضغط على زر "Sync Now" أو الفيل الأزرق بالأعلى. سيقوم البرنامج تلقائياً بتحميل مكتبات Jetpack Compose و Material 3 و AdMob و Firebase المحددة في ملف libs.versions.toml.'
                  : 'Click "Sync Now" in the top bar to resolve all Jetpack Compose and Firebase dependencies.'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#070A14] border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-black font-black text-xs flex items-center justify-center">4</span>
                <span className="font-bold text-white text-xs sm:text-sm">
                  {isAr ? 'توليد ملف الـ APK النهائي' : 'Build APK(s)'}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isAr
                  ? 'من شريط القوائم العلوي اضغط: Build > Build Bundle(s) / APK(s) > Build APK(s). بعد انتهاء البناء اضغط على رابط locate في الإشعار، وستجد ملف app-debug.apk جاهزاً للنسخ لهاتفك وتثبيته مباشرة!'
                  : 'From top menu: Build > Build Bundle(s) / APK(s) > Build APK(s). Click "locate" when complete to find app-debug.apk!'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CODE FILES EXPLORER */}
      {activeTab === 'files' && (
        <div className="space-y-4">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                    : 'bg-[#090D18] border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Main Code Studio: File Selector + Viewer */}
          <div className="bg-[#0B0F1B] rounded-2xl border border-slate-800 overflow-hidden shadow-xl flex flex-col">
            {/* Horizontal Scrollable File Tabs */}
            <div className="bg-[#080B14] p-2 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {filteredFiles.map((file) => {
                const isSelected = file.path === selectedFile.path;
                return (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFile(file)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all border cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/60 text-amber-300 font-bold'
                        : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800/80 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5 shrink-0" />
                    <span>{file.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected File Toolbar */}
            <div className="bg-[#0F1424] px-4 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="font-mono text-xs text-cyan-400 font-bold block truncate">
                  {selectedFile.path}
                </span>
                <span className="text-[11px] text-slate-400 truncate block">
                  {selectedFile.description}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyCode()}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all shadow-sm shadow-amber-500/20 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? (isAr ? 'تم النسخ!' : 'Copied!') : isAr ? 'نسخ الكود' : 'Copy Code'}</span>
                </button>

                <button
                  onClick={handleDownloadFile}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                  title="Download file"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{isAr ? 'تحميل الملف' : 'Download'}</span>
                </button>
              </div>
            </div>

            {/* Code View Area */}
            <div className="relative p-4 overflow-x-auto bg-[#07090F] font-mono text-xs text-slate-200 leading-relaxed max-h-[500px] overflow-y-auto">
              <pre className="select-text whitespace-pre">
                <code>{selectedFile.code}</code>
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DIRECTORY TREE */}
      {activeTab === 'tree' && (
        <div className="bg-[#0B0F1D] rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white">
                {isAr ? 'الهيكلة الشجرية الكاملة لمشروع Android Studio' : 'Android Project Directory Structure'}
              </h3>
              <p className="text-xs text-slate-400">
                {isAr
                  ? 'ترتيب الملفات والمجلدات وفق المعايير الرسمية لشركة Google و Android Jetpack.'
                  : 'Official Gradle multi-module structure with Version Catalog and Compose UI hierarchy.'}
              </p>
            </div>
          </div>

          <div className="p-4 bg-[#070912] rounded-xl border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto">
            <pre>{`ChahnDzStore/
├── .github/
│   └── workflows/
│       └── build-apk.yml             # سير عمل GitHub Actions لبناء APK سحابياً
├── app/
│   ├── build.gradle.kts             # إعدادات موديول التطبيق ومكتبات Compose & Firebase
│   ├── src/
│   │   └── main/
│   │       ├── AndroidManifest.xml   # الأذونات واستعلامات الواتساب والتكامل
│   │       ├── java/com/chahndz/app/
│   │       │   ├── ChahnDzApplication.kt   # تهيئة التطبيق و AdMob MobileAds
│   │       │   ├── MainActivity.kt          # النشاط الرئيسي وتشغيل Compose
│   │       │   ├── auth/
│   │       │   │   └── FirebaseAuthManager.kt # تسجيل الدخول وصلاحيات المسؤول
│   │       │   ├── data/
│   │       │   │   └── repository/
│   │       │   │       └── PlayerVerificationRepository.kt # فحص Player ID
│   │       │   ├── model/
│   │       │   │   ├── Order.kt             # كائن الطلب مع الوصل والكود الرقمي
│   │       │   │   ├── Product.kt           # تصنيفات الألعاب والبطاقات
│   │       │   │   └── Coupon.kt            # قسائم الخصم والتخفيضات
│   │       │   └── ui/
│   │       │       ├── components/
│   │       │       │   ├── ProductCardComponent.kt # بطاقة المنتج مع زري السلة والشراء
│   │       │       │   ├── InGamePlayerVerificationCard.kt # فحص وتأكيد اسم اللاعب
│   │       │       │   └── AdMobBannerComponent.kt # إعلانات AdMob
│   │       │       ├── navigation/
│   │       │       │   └── AppNavigation.kt    # شريط التنقل السفلي (4 تبويبات)
│   │       │       ├── orders/
│   │       │       │   └── OrdersScreen.kt     # شاشة تسليم الأكواد والبطاقات
│   │       │       └── theme/
│   │       │           ├── Color.kt            # ألوان الوضع الليلي والفاتح
│   │       │           ├── Theme.kt            # مظهر Compose الديناميكي
│   │       │           └── ThemePreferences.kt # حفظ اختيار المستخدم بـ DataStore
│   │       └── res/
│   │           ├── values/strings.xml           # النصوص الإنجليزية
│   │           ├── values-ar/strings.xml        # النصوص العربية مع دعم RTL
│   │           └── layout/
│   │               └── item_product_card.xml    # تخطيط XML البديل
├── gradle/
│   └── libs.versions.toml           # كتالوج النسخ الرسمي (Version Catalog)
├── build.gradle.kts                 # ملف البناء الجذري (Root Project)
├── settings.gradle.kts              # إعداد المستودعات وموديول app
├── gradle.properties                # خيارات أداء الذاكرة و AndroidX
├── firestore.rules                  # قواعد حماية قاعدة البيانات وصلاحيات الأدمن
└── README.md                        # دليل الاستخدام والتثبيت`}</pre>
          </div>
        </div>
      )}
    </div>
  );
};
