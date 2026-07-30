import { Router } from 'express';
import { imageUploadRoute } from '../modules/imageUpload/imageUpload.route.js';
import { uiRoute } from '../modules/ui/ui.route.js';
import { productRoute } from '../modules/product/product.route.js';
import { orderRoute } from '../modules/order/order.route.js';
import { authRoute } from '../modules/auth/auth.route.js';
import { courierRoute } from '../modules/courier/courier.route.js';
import { bannersRoute } from '../modules/banners/banners.route.js';
import { feedRoute } from '../modules/feed/feed.route.js';

const router = Router();

const moduleRoutes = [
    { path: "/image-upload", route: imageUploadRoute },
    { path: "/ui",           route: uiRoute },
    { path: "/products",     route: productRoute },
    { path: "/orders",       route: orderRoute },
    { path: "/auth",         route: authRoute },
    { path: "/courier",      route: courierRoute },
    { path: "/banners",      route: bannersRoute },
    { path: "/feed",         route: feedRoute },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;