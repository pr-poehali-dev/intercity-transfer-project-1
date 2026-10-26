import {useEffect, type ReactNode} from "react";
import {HeadContent, Outlet, Scripts, createRootRoute} from "@tanstack/react-router";
import {Toaster} from "@/components/ui/toaster";
import {Toaster as Sonner} from "@/components/ui/sonner";
import {TooltipProvider} from "@/components/ui/tooltip";
import {PLATFORM_META, PLATFORM_SCRIPTS} from "@/platform/scripts.gen";
import {HMR_CLIENT} from "@/platform/dev-hmr";
import {useLocation} from "@/lib/router-compat";
import {JSON_LD} from "@/lib/jsonLd";
import NotFound from "@/pages/NotFound";
import InstallAppBanner from "@/components/transfer/InstallApp";
import OfflineBanner from "@/components/transfer/OfflineBanner";
import appCss from "@/index.css?url";

const TITLE = "НАШЕ Трансфер от 50 км | Аэропорты, вокзалы, автовокзалы — фиксированная цена здесь";
const DESCRIPTION =
    "Уехать дешевле такси? Закажите трансфер у нас! Более 5000 водителей по РФ. Расчитайте стоимость поездки на сайте. тел: +79961606567, +79192667885";
const OG_IMAGE = "https://cdn.poehali.dev/projects/***/files/og-image-1780613995973.jpg";
const KEYWORDS =
    "междугородний трансфер, такси между городами, трансфер по России, заказать трансфер онлайн, межгород такси фиксированная цена, трансфер без агрегатора, аренда авто с водителем, трансфер от двери до двери, такси Москва Санкт-Петербург, такси Москва Сочи, такси Москва Краснодар, такси Москва Казань, такси Москва Нижний Новгород, такси Москва Воронеж, такси Москва Ростов-на-Дону, такси Москва Екатеринбург, такси Москва Самара, такси Москва Анапа, такси Москва Геленджик, трансфер Москва Петербург цена, трансфер Москва Сочи цена, заказ машины между городами, частный водитель межгород, индивидуальный трансфер Россия";

const METRIKA = `(function(m,e,t,r,i,k,a){
    m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
    m[i].l=1*new Date();
    for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
    k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
})(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=109705581', 'ym');
ym(109705581, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});`;

const SW_REGISTER = `if ("serviceWorker" in navigator && ${import.meta.env.PROD ? "true" : "false"}) {
  window.addEventListener("load", function () { navigator.serviceWorker.register("/sw.js").catch(function () {}); });
}`;

export const Route = createRootRoute({
    head: () => ({
        meta: [
            {charSet: "utf-8"},
            {name: "viewport", content: "width=device-width, initial-scale=1.0"},
            {title: TITLE},
            {name: "description", content: DESCRIPTION},
            {name: "keywords", content: KEYWORDS},
            {name: "robots", content: "index, follow"},
            {name: "yandex-verification", content: "13505bd615bcc5d4"},
            {name: "google-site-verification", content: "FW9zoynp978IMDUdYEYQBC47SKR2CrFUGEIVXMMcg7U"},
            {name: "author", content: "НАШЕ for Russia Transfer"},
            {name: "theme-color", content: "#0d1014"},
            {name: "apple-mobile-web-app-capable", content: "yes"},
            {name: "mobile-web-app-capable", content: "yes"},
            {name: "apple-mobile-web-app-status-bar-style", content: "black-translucent"},
            {name: "apple-mobile-web-app-title", content: "НАШЕ Трансфер"},
            {property: "og:type", content: "website"},
            {property: "og:locale", content: "ru_RU"},
            {property: "og:site_name", content: "НАШЕ for Russia Transfer"},
            {property: "og:title", content: TITLE},
            {property: "og:description", content: DESCRIPTION},
            {property: "og:image", content: OG_IMAGE},
            {property: "og:image:width", content: "1200"},
            {property: "og:image:height", content: "630"},
            {property: "og:image:alt", content: "НАШЕ for Russia Transfer — междугородние перевозки"},
            {name: "twitter:card", content: "summary_large_image"},
            {name: "twitter:title", content: "Междугородний трансфер по России — фиксированная цена | НАШЕ Transfer"},
            {
                name: "twitter:description",
                content:
                    "Закажите комфортный трансфер между городами России по фиксированной цене — без агрегаторов и скрытых доплат. Маршруты из Москвы в Сочи, Петербург, Краснодар, Казань и 100+ городов.",
            },
            {name: "twitter:image", content: OG_IMAGE},
            ...PLATFORM_META,
        ],
        links: [
            {rel: "stylesheet", href: appCss},
            {rel: "canonical", href: "https://nashe-transfer.ru/"},
            {rel: "preconnect", href: "https://fonts.googleapis.com"},
            {rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous"},
            {
                rel: "stylesheet",
                href: "https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Golos+Text:wght@400;500;600;700&display=swap",
            },
            {rel: "icon", type: "image/svg+xml", href: "/favicon.svg"},
            {rel: "manifest", href: "/manifest.webmanifest"},
            {rel: "apple-touch-icon", href: "/icons/apple-touch-icon.png"},
        ],
        // IMPORTANT: DO NOT REMOVE PLATFORM SCRIPTS AND THE DEV HMR CLIENT!
        scripts: [
            ...(import.meta.env.DEV ? [{children: HMR_CLIENT}] : []),
            ...PLATFORM_SCRIPTS,
            ...JSON_LD.map((obj) => ({type: "application/ld+json", children: JSON.stringify(obj)})),
            {children: METRIKA},
            {children: SW_REGISTER},
        ],
    }),
    component: RootComponent,
    notFoundComponent: NotFound,
});

function ScrollToTop() {
    const {pathname, hash} = useLocation();
    useEffect(() => {
        if (hash) {
            const id = hash.slice(1);
            const scroll = () => {
                const el = document.getElementById(id);
                if (el) el.scrollIntoView({behavior: "smooth"});
            };
            requestAnimationFrame(() => setTimeout(scroll, 60));
            return;
        }
        window.scrollTo(0, 0);
    }, [pathname, hash]);
    return null;
}

function RootComponent() {
    return (
        <RootDocument>
            <TooltipProvider>
                <Toaster/>
                <Sonner/>
                <ScrollToTop/>
                <OfflineBanner/>
                <InstallAppBanner/>
                <Outlet/>
            </TooltipProvider>
        </RootDocument>
    );
}

function RootDocument({children}: { children: ReactNode }) {
    return (
        <html lang="ru">
        <head>
            <HeadContent/>
        </head>
        <body>
        <noscript>
            <div><img src="https://mc.yandex.ru/watch/109705581" style={{position: "absolute", left: "-9999px"}} alt=""/></div>
        </noscript>
        {children}
        <Scripts/>
        </body>
        </html>
    );
}
