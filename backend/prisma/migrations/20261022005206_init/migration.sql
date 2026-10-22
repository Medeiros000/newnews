-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "icon" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "news" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category_id" TEXT NOT NULL,
    "badge_bg" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "published_at" DATETIME NOT NULL,
    "author" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    CONSTRAINT "news_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");
