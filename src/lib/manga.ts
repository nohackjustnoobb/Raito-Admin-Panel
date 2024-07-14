import { get, writable } from "svelte/store";

import { connected, connection } from "./connection";

const categories = [
  "All",
  "Passionate",
  "Love",
  "Campus",
  "Yuri",
  "Otokonoko",
  "BL",
  "Adventure",
  "Harem",
  "SciFi",
  "War",
  "Suspense",
  "Speculation",
  "Funny",
  "Fantasy",
  "Magic",
  "Horror",
  "Ghosts",
  "History",
  "FanFi",
  "Sports",
  "Hentai",
  "Mecha",
  "Restricted",
];

enum Status {
  Any,
  OnGoing,
  Ended,
}

const manga = writable<{ [id: string]: Manga }>({});
const list = writable<{ [id: string]: { [page: number]: Array<string> } }>({});

class Manga {
  /**
   * The id of the manga.
   */
  id: string;
  /**
   * The title of the manga.
   */
  title: string;
  /**
   * The latest chapter of the manga.
   */
  latest: string;
  /**
   * Determines whether the manga is ended.
   */
  isEnded: boolean;
  /**
   * The thumbnail address of the manga
   */
  thumbnail: string;

  /**
   * Creates an instance of Manga.
   *
   * @constructor
   * @param data Object (required)
   */
  constructor(data: any) {
    this.id = data.id;
    this.title = data.title;
    this.latest = data.latest;
    this.isEnded = data.isEnded;
    this.thumbnail = data.thumbnail;
  }

  static async getList(
    category: string = "All",
    status: Status = Status.Any,
    page: number = 1,
    useCache: boolean = true
  ): Promise<boolean> {
    if (!get(connected)) return false;

    const listValue = get(list);
    let cached = listValue[status + category];

    // check if the end is reached
    if (cached) {
      const lastIndex = Number(
        Object.keys(cached).toSorted((a, b) => Number(b[0]) - Number(a[0]))[0]
      );
      if (page > lastIndex && !cached[lastIndex].length) return false;
    }

    // check if cached
    if (cached && cached[page] && useCache) return true;

    const result = await connection.get("list", {
      ...(category !== "All" && { category: category }),
      status: String(status),
      page: String(page),
    });
    if (!result.ok) return false;

    const mangas = await result.json();
    if (!cached) cached = {};
    cached[page] = [];

    const mangaValue = get(manga);

    // convert the data to SimpleManga objects
    mangas.forEach((v: any) => {
      const manga: Manga = new Manga(v);
      // cache the manga
      mangaValue[manga.id] = manga;

      // push it to list
      cached[page].push(manga.id);
    });

    // updata writable
    listValue[status + category] = cached;
    list.set(listValue);
    manga.set(mangaValue);

    return true;
  }

  static async getSuggestions(keywords: string): Promise<Array<string>> {
    if (!get(connected) || !keywords) return [];

    const result = await connection.get("suggestion", {
      keyword: keywords,
    });
    if (!result.ok) return [];

    return await result.json();
  }

  static async search(keywords: string, page: number): Promise<Array<Manga>> {
    if (!get(connected) || !keywords) return [];

    const result = await connection.get("search", {
      keyword: keywords,
      page: page.toString(),
    });
    if (!result.ok) return [];

    return (await result.json()).map((v: any) => new Manga(v));
  }

  async toDetails(): Promise<DetailsManga> {
    if (!get(connected)) throw "Not connected";

    const result = await connection.get("manga", {
      ids: this.id,
      "show-all": "1",
    });

    if (!result.ok) throw "Error: " + result.status;

    return new DetailsManga((await result.json())[0]);
  }
}

type Chapter = {
  title: string;
  id: string;
};

type Chapters = {
  serial: Array<Chapter>;
  extra: Array<Chapter>;
  extraData: string;
};

class DetailsManga extends Manga {
  /**
   * Description of the manga.
   */
  description: string;
  /**
   * The categories of the manga.
   */
  categories: Array<string>;
  /**
   * All the chapters that the manga has.
   */
  chapters: Chapters;
  /**
   * The authors of the manga.
   */
  authors: Array<string>;
  /**
   *  The update time of the latest chapter
   */
  updateTime: null | Date = null;

  /**
   * Creates an instance of Manga.
   *
   * @constructor
   * @param Object (required)
   */
  constructor(data: any) {
    super(data);

    this.authors = data.authors;
    this.description = data.description;
    this.categories = data.categories;
    this.chapters = data.chapters;
    this.latest =
      data.latest ??
      (this.chapters.serial.length === 0
        ? this.chapters.extra[0].title
        : this.chapters.serial[0].title);
    if (data.updateTime) this.updateTime = new Date(data.updateTime * 1000);
  }

  toJson() {
    return {
      authors: this.authors,
      categories: this.categories,
      chapters: this.chapters,
      description: this.description,
      id: this.id,
      isEnded: this.isEnded,
      latest: this.latest,
      thumbnail: this.thumbnail,
      title: this.title,
      updateTime: this.updateTime && this.updateTime.getTime() / 1000,
    };
  }

  async getChapter(id: string): Promise<Array<string>> {
    if (!get(connected)) return [];

    try {
      const resp = await connection.get("chapter", {
        id: id,
        "extra-data": this.chapters.extraData,
      });

      if (resp.ok) return await resp.json();
    } catch (e) {}

    return [];
  }

  async upload(create: boolean = false): Promise<boolean> {
    if (!get(connected)) return false;

    try {
      const body = this.toJson();
      const resp = await (create
        ? connection.post("manga/edit", {}, body)
        : connection.put("manga/edit", {}, body));

      // update the writable
      if (resp.ok) {
        const json = await resp.json();
        this.id = json.id;
        this.chapters = json.chapters;
        if (json.updateTime) this.updateTime = new Date(json.updateTime * 1000);

        const mangaValue = get(manga);
        mangaValue[this.id] = this;
        manga.set(mangaValue);

        if (create) {
          const listValue = get(list);

          for (const category of ["All", ...this.categories]) {
            // update Any + category
            const anyCategory = listValue[Status.Any + category];
            if (anyCategory && anyCategory[1]) {
              anyCategory[1].unshift(this.id);
              listValue[Status.Any + category] = anyCategory;
            }

            // update Ended/OnGoing + category
            const filteredCategory =
              listValue[
                this.isEnded ? Status.Ended : Status.OnGoing + category
              ];
            if (filteredCategory && filteredCategory[1]) {
              filteredCategory[1].unshift(this.id);
              listValue[
                this.isEnded ? Status.Ended : Status.OnGoing + category
              ] = filteredCategory;
            }
          }

          list.set(listValue);
        }
      }

      return resp.ok;
    } catch (e) {}

    return false;
  }

  async uploadThumbnail(image: string): Promise<boolean> {
    if (!get(connected)) return false;

    try {
      const resp = await connection.post("image/edit", { id: this.id }, image, {
        "Content-Type": "text/plain",
      });

      if (resp.ok) {
        const updated = await this.toDetails();
        this.thumbnail = updated.thumbnail;

        const mangaValue = get(manga);
        if (mangaValue[this.id]) {
          mangaValue[this.id].thumbnail = updated.thumbnail;
          manga.set(mangaValue);
        }
      }

      return resp.ok;
    } catch (e) {}

    return false;
  }

  async uploadImages(id: string, images: string[]): Promise<Array<string>> {
    if (!get(connected)) return [];

    try {
      const resp = await connection.post(
        "image/edit",
        { id, "extra-data": this.chapters.extraData },
        images
      );
      if (resp.ok) return await resp.json();

      return [];
    } catch (e) {}

    return [];
  }

  async uploadChapters(chapters: Chapters): Promise<boolean> {
    if (!get(connected)) return false;

    try {
      const resp = await connection.put("chapters/edit", {}, chapters);

      if (resp.ok) this.chapters = await resp.json();

      return resp.ok;
    } catch (e) {}

    return false;
  }

  async uploadChapter(id: string, urls: Array<string>): Promise<boolean> {
    if (!get(connected)) return false;

    try {
      const resp = await connection.put(
        "image/edit",
        {
          id,
          "extra-data": this.chapters.extraData,
        },
        urls
      );

      return resp.ok;
    } catch (e) {}

    return false;
  }

  static async create(
    title: string,
    description: string,
    isEnded: boolean,
    authors: Array<string>,
    categories: Array<string>
  ): Promise<boolean> {
    const data: any = {};

    // Real data
    data.title = title;
    data.description = description;
    data.isEnded = isEnded;
    data.authors = authors;
    data.categories = categories;

    // Placeholder
    data.id = "";
    data.thumbnail = "";
    data.latest = "";
    data.chapters = {};

    const manga = new DetailsManga(data);

    return await manga.upload(true);
  }

  async update(
    title: string,
    description: string,
    isEnded: boolean,
    authors: Array<string>,
    categories: Array<string>
  ): Promise<boolean> {
    this.title = title;
    this.description = description;
    this.isEnded = isEnded;
    this.authors = authors;
    this.categories = categories;

    return await this.upload();
  }

  async createChapter(title: string, isExtra: boolean): Promise<boolean> {
    if (!get(connected)) return false;

    try {
      const body = {
        extraData: this.chapters.extraData,
        title: title,
        isExtra: isExtra,
      };
      const resp = await connection.post("chapters/edit", {}, body);

      // update the chapters
      if (resp.ok) {
        this.chapters = await resp.json();
        this.latest = title;

        const mangaValue = get(manga);
        if (mangaValue[this.id]) mangaValue[this.id].latest = title;
        manga.set(mangaValue);
      }

      return resp.ok;
    } catch (e) {}

    return false;
  }

  async delete(): Promise<boolean> {
    if (!get(connected)) return false;

    try {
      const resp = await connection.delete("manga/edit", { id: this.id });

      if (resp.ok) {
        const listValue = get(list);

        for (const category of ["All", ...this.categories]) {
          // update Any + category
          const anyCategory = listValue[Status.Any + category];
          if (anyCategory) {
            for (const [key, value] of Object.entries(anyCategory))
              anyCategory[Number(key)] = value.filter((v) => v !== this.id);
            listValue[Status.Any + category] = anyCategory;
          }

          // update Ended/OnGoing + category
          const filteredCategory =
            listValue[this.isEnded ? Status.Ended : Status.OnGoing + category];
          if (filteredCategory) {
            for (const [key, value] of Object.entries(filteredCategory))
              filteredCategory[Number(key)] = value.filter(
                (v) => v !== this.id
              );
            listValue[this.isEnded ? Status.Ended : Status.OnGoing + category] =
              filteredCategory;
          }
        }

        const mangaValue = get(manga);
        if (mangaValue[this.id]) delete mangaValue[this.id];

        list.set(listValue);
        manga.set(mangaValue);
      }

      return resp.ok;
    } catch (e) {}

    return false;
  }

  async deleteChapter(id: string): Promise<boolean> {
    if (!get(connected)) return false;

    try {
      const resp = await connection.delete("chapters/edit", {
        id: id,
        "extra-data": this.chapters.extraData,
      });

      this.chapters.serial = this.chapters.serial.filter((v) => v.id !== id);
      this.chapters.extra = this.chapters.extra.filter((v) => v.id !== id);

      return resp.ok;
    } catch (e) {}

    return false;
  }

  async deleteChapterImage(id: string, url: string): Promise<boolean> {
    if (!get(connected)) return false;

    try {
      const resp = await connection.delete("image/edit", {
        id,
        url,
        "extra-data": this.chapters.extraData,
      });

      return resp.ok;
    } catch (e) {}

    return false;
  }
}

export { categories, DetailsManga, list, manga, Manga, Status };
export type { Chapter, Chapters };