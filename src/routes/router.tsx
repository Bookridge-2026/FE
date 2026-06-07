import { createBrowserRouter } from "react-router-dom";

import { BaseLayout } from "@/layouts/BaseLayout";
import { AppLayout } from "@/layouts/AppLayout";
import { PrivateRoute } from "@/routes/PrivateRoute";

import LoginPage from "@/pages/LoginPage";
import OAuthCallbackPage from "@/pages/OAuthCallbackPage";
import NicknamePage from "@/pages/NicknamePage";

import HomePage from "@/pages/HomePage";

import NoticePage from "@/pages/NoticePage";

import UserProfilePage from "@/pages/users/UserProfilePage";

import RoomSearchPage from "@/pages/rooms/search/RoomSearchPage";

import RoomCreatePage from "@/pages/rooms/create/RoomCreatePage";
import BookSearchPage from "@/pages/rooms/create/BookSearchPage";

import RoomDetailPage from "@/pages/rooms/RoomDetailPage";
import RoomManagePage from "@/pages/rooms/RoomManagePage";

import OcrCreatePage from "@/pages/ocr/OcrCreatePage";
import OcrResultPage from "@/pages/ocr/OcrResultPage";
import OcrDetailPage from "@/pages/ocr/OcrDetailPage";

import MyPage from "@/pages/mypage/MyPage";
import MyFriendsPage from "@/pages/mypage/MyFriendsPage";
import MyRoomsPage from "@/pages/mypage/MyRoomsPage";
import MyBooksPage from "@/pages/mypage/MyBooksPage";
import BlockedUsersPage from "@/pages/mypage/BlockedUsersPage";

import NotFoundPage from "@/pages/NotFoundPage";
import FriendsPage from "@/pages/FriendsPage";

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
        path: "/nickname",
        element: <NicknamePage />,
      },
      {
        element: <PrivateRoute />,
        children: [
          {
            path: "/rooms/:roomId/ocr/create",
            element: <OcrCreatePage />,
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
                path: "/notice",
                element: <NoticePage />,
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
                path: "/rooms/:roomId/ocr/result",
                element: <OcrResultPage />,
              },
              {
                path: "/rooms/:roomId/ocr/:ocrPageId",
                element: <OcrDetailPage />,
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