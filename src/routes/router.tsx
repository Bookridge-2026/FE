import { createBrowserRouter } from "react-router-dom";

import { BaseLayout } from "@/layouts/BaseLayout";
import { AppLayout } from "@/layouts/AppLayout";
import { PrivateRoute } from "@/routes/PrivateRoute";

import LoginPage from "@/pages/LoginPage";
import OAuthCallbackPage from "@/pages/OAuthCallbackPage";
import NicknamePage from "@/pages/NicknamePage";

import HomePage from "@/pages/HomePage";
import FriendsPage from "@/pages/FriendsPage";

import UserProfilePage from "@/pages/users/UserProfilePage";

import RoomSearchPage from "@/pages/rooms/search/RoomSearchPage";

import RoomCreatePage from "@/pages/rooms/create/RoomCreatePage";
import BookSearchPage from "@/pages/rooms/create/BookSearchPage";

import RoomDetailPage from "@/pages/rooms/RoomDetailPage";
import RoomManagePage from "@/pages/rooms/RoomManagePage";

import OcrCreatePage from "@/pages/ocr/OcrCreatePage";
import OcrPageDetailPage from "@/pages/ocr/OcrPageDetailPage";

import MyPage from "@/pages/mypage/MyPage";
import MyFriendsPage from "@/pages/mypage/MyFriendsPage";
import MyRoomsPage from "@/pages/mypage/MyRoomsPage";
import MyBooksPage from "@/pages/mypage/MyBooksPage";
import BlockedUsersPage from "@/pages/mypage/BlockedUsersPage";

import NotFoundPage from "@/pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    element: <BaseLayout />,
    children: [
      {
        path: "/",
        element: <LoginPage />,
      },
      {
        path: "/oauth/callback",
        element: <OAuthCallbackPage />,
      },
      {
        element: <PrivateRoute />,
        children: [
          {
            path: "/nickname",
            element: <NicknamePage />,
          },
          {
            element: <AppLayout />,
            children: [
              {
                path: "/home",
                element: <HomePage />,
              },
              {
                path: "/friends",
                element: <FriendsPage />,
              },
              {
                path: "/users/:userId",
                element: <UserProfilePage />
              },
              {
                path: "/rooms/search",
                element: <RoomSearchPage />,
              },
              {
                path: "/rooms/create",
                element: <RoomCreatePage />,
              },
              {
                path: "/rooms/create/book-search",
                element: <BookSearchPage />,
              },
              {
                path: "/rooms/:roomId",
                element: <RoomDetailPage />,
              },
              {
                path: "/rooms/:roomId/manage",
                element: <RoomManagePage />,
              },
              {
                path: "/rooms/:roomId/ocr/create",
                element: <OcrCreatePage />,
              },
              {
                path: "/rooms/:roomId/ocr/:ocrPageId",
                element: <OcrPageDetailPage />,
              },
              {
                path: "/mypage",
                element: <MyPage />,
              },
              {
                path: "/mypage/friends",
                element: <MyFriendsPage />,
              },
              {
                path: "/mypage/rooms",
                element: <MyRoomsPage />,
              },
              {
                path: "/mypage/books",
                element: <MyBooksPage />,
              },
              {
                path: "/mypage/blocked",
                element: <BlockedUsersPage />,
              },
            ],
          },
        ],
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);