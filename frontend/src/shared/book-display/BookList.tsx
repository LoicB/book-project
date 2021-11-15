/*
The book project lets a user keep track of different books they would like to read, are currently
reading, have read or did not finish.
Copyright (C) 2021  Karan Kumar

This program is free software: you can redistribute it and/or modify it under the terms of the
GNU General Public License as published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
PURPOSE.  See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program.
If not, see <https://www.gnu.org/licenses/>.
*/

import React, { useState} from 'react'
import { Book } from '../types/Book';
import './BookList.css';
import {ArrowDropDown, ArrowDropUp} from "@material-ui/icons";

const CHAR_LIMIT = 40;

export interface BookListProps {
    bookListData: Book[];
}

interface SortingConfig {
    propertyName: string;
    order: SortingOrder,
}

enum SortingOrder{
    ASCENDING,
    DESCENDING,
}

export default function BookList(props: BookListProps): JSX.Element {
    const [sortingConfigs, updateConfigurations] = useState<SortingConfig[]>([]);
    const nameToOrder = getNameToOrder(sortingConfigs);

    const sortBy = React.useCallback(        (propertyName: string) => {
            const pendingChange = [...sortingConfigs];
            const sortingIndex = sortingConfigs
                .findIndex(configuration => configuration.propertyName === propertyName);
            if (sortingIndex !== -1) {
                const configuration: SortingConfig = sortingConfigs[sortingIndex];
                if (configuration.order === SortingOrder.ASCENDING) {
                    pendingChange[sortingIndex] = {propertyName, order: SortingOrder.DESCENDING};
                } else {
                    pendingChange.splice(sortingIndex, 1);
                }
            } else {
                pendingChange.push({propertyName, order: SortingOrder.ASCENDING});
            }
            updateConfigurations(pendingChange);
        },
        [sortingConfigs]
    )
    return (
        <div className="booklist-container">
            <div className="booklist-container-headers booklist-book">
                <div className="booklist-book-thumbnail" />
                <div className="booklist-book-title" onClick={()=> sortBy('title')}>
                    Title{getSortingIcon('title', nameToOrder)}
                </div>
                <div className="booklist-book-author" onClick={()=> sortBy('author')}>
                    Author{getSortingIcon('author', nameToOrder)}
                </div>
                <div className="booklist-book-shelf" onClick={()=> sortBy('shelf')}>
                    Shelf{getSortingIcon('shelf', nameToOrder)}
                </div>
                <div className="booklist-book-genre" onClick={()=> sortBy('genre')}>
                    Genre{getSortingIcon('genre', nameToOrder)}
                </div>
                <div className="booklist-book-rating" onClick={()=> sortBy('rating')}>
                    Rating{getSortingIcon('rating', nameToOrder)}
                </div>
            </div>
            {sortBook(props.bookListData, sortingConfigs).map(book => (
                <div className="booklist-book" key={book.title}>
                    <div className="booklist-book-thumbnail">
                        {book.title.length > CHAR_LIMIT ?
                            book.title.substring(0, CHAR_LIMIT) + "..." : book.title}
                    </div>
                    <div className="booklist-book-title">{book.title}</div>
                    <div className="booklist-book-author">{book.author.fullName}</div>
                    <div className="booklist-book-shelf">{book.predefinedShelf.shelfName}</div>
                    <div className="booklist-book-genre">{book.bookGenre}</div>
                    <div className="booklist-book-rating">{book.rating}</div>
                </div>
            ))}
        </div>
    )
}

function sortBook(books: Book[], sortConfigurations: SortingConfig[]): Book[] {
    const sortedBooks = [...books];
    sortConfigurations.forEach(config => {
        const sortingMechanism = getSortingMechanism(config);
        sortedBooks.sort(sortingMechanism)
    })
    return sortedBooks;
}

function getSortingMechanism(config: SortingConfig): (book1: Book, book2: Book) => number {
    const orderIndex = config.order === SortingOrder.ASCENDING ? 1 : -1;
    switch (config.propertyName) {
        default:
        case 'title':
            return ((book1: Book, book2: Book) =>
                orderIndex * book1.title.localeCompare(book2.title));
        case 'author':
            return ((book1: Book, book2: Book) =>
                orderIndex * book1.author.fullName.localeCompare(book2.author.fullName));
        case 'shelf':
            return ((book1: Book, book2: Book) =>
                orderIndex * book1.predefinedShelf.shelfName
                    .localeCompare(book2.predefinedShelf.shelfName));
        case 'genre':
            return ((book1: Book, book2: Book) =>
                orderIndex * book1.bookGenre.toString().localeCompare(book2.bookGenre.toString()));
        case 'rating':
            return ((book1: Book, book2: Book) =>
                orderIndex * book1.rating.toString().localeCompare(book2.rating.toString()));
    }
}

function getNameToOrder(configurations: SortingConfig[]): Map<string, SortingOrder> {
    const nameToOrder = new Map<string, SortingOrder>();
    configurations.forEach(configuration =>
        nameToOrder.set(configuration.propertyName, configuration.order));
    return nameToOrder;
}

function getSortingIcon(propertyName: string, nameToOrder: Map<string, SortingOrder>): JSX.Element {
    const order = nameToOrder.get(propertyName);
    if (order !== undefined) {
        if (order === SortingOrder.ASCENDING) {
            return <ArrowDropUp fontSize="inherit" className="booklist-sorting-arrow-icons" />;
        }
        return <ArrowDropDown fontSize="inherit" className="booklist-sorting-arrow-icons" />;
    }
    return <div />;
}
