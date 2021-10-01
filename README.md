# comments-api-server

## Description

> This server is intended for informational purposes only, you do not need to use it in production, since it is not protected from hacking in any way and may contain errors.

## Install & run

For a local demonstration, you need to run 2 servers, the server from which you will receive data, and the server that will display the page

#### Server Back-End

###### Download repository
```bash
git clone https://github.com/EvgeniySaschenko/comments-api-server.git
```

###### Install dependencies
```bash
npm install
```

###### Run server
```bash
npm run dev
```

The server will be available at: http://localhost:8888/

#### Server Front-End

###### Download repository
```bash
git clone https://github.com/EvgeniySaschenko/vue-comments.git
```

###### Install dependencies
```bash
npm install
```

###### Run server
```bash
npm run dev
```

The server will be available at: http://localhost:8080/


## Example response


- От бекенда нам необходимо получить 2 объекта `items` и `mapItems` - где ключами являются id комментариев:

#### items - список комментаририев
```
  {
    1549 : {
      dateCreate: 1632329876,
      dateUpdate: 1632329889,
      dislike: 0,
      like: 0,
      voteValue: 0,
      files: [],
      id: 1549,
      isManageDelete: false,
      isManageEdit: false,
      parentId: 0,
      text: "text 😇😇😇😇",
      userImg: "http://localhost:8888/images/users/6.jpg",
      userName: "Jhon",
    },
    1550 : {
      dateCreate: 1632329876,
      dateUpdate: 1632329889,
      dislike: 2,
      like: 0,
      voteValue: -1,
      files: ["http://localhost:8888/images/comments/1581_0.jpg"],
      id: 1550,
      isManageDelete: false,
      isManageEdit: false,
      parentId: 1549,
      text: "text text",
      userImg: "",
      userName: "Ivan",
    }
  }
```

#### items - список комментаририев
| Parameter | Type | Value | Description |
| --- | :---: | :---: | --- |
| dateCreate | `Number` | timestamp | дата создания |
| dateUpdate | `Number` | 0 / timestamp | дата редактирования |
| dislike | `Number` | <= 0 | количество дизлайков |
| like | `Number` | <= 0 | количество лайков |
| voteValue | `Number` | 0 - не голосовал, <br> 1 - like, <br> -1 - dislike | пользователь поставил лайк, дизлайк или  не голосовал |
| files | `Array` | [] - нет файлов,<br> ["ссылка на файл 1", "ссылка на файл 2"] - есть файлы | список файлов |
| id | `Number` / `String` | Number / String |  уникальный индификатор комментирия |
| isManageDelete | `Boolean` | true / false | указывает на то что данный пользователь имеет право удалить комментирий |
| isManageEdit | `Boolean` | true / false | указывает на то что данный пользователь имеет право редактировать комментирий |
| parentId | `Number` / `String` | Number / String | индификатор предка (id комментария на который ответили) |
| text | `String` | String | текст комментария |
| userImg | `String` | String | изображение автора комментария |
| userName | `String` | String | имя автора комментария |

#### mapItems - описывает иерархию дерева (вложенность и последовательность) и количество комменрариев

**mapItems - описывает иерархию дерева (вложенность и последовательность) и количество комменрариев

```json
{

}
```
