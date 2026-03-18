import { createRouter, createWebHistory } from "vue-router"
import StartPage from "../pages/StartPage.vue"
import ResultPage from "../pages/ResultPage.vue"
import UserCreate from "../pages/UserCreate.vue"
import BattlePage from "../pages/BattlePage.vue"


const routes = [
    {
        path: "/",
        component: StartPage,

    },
    {

        path: "/result",
        component: ResultPage,
    },
    {
        path: "/battle",
        component: BattlePage,
    },
    {
        path: "/user",
        component: UserCreate,
    }]
const router = createRouter({
    history: createWebHistory(),
    routes,
})
export default router