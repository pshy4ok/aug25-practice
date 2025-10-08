/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState } from 'react';
import './App.scss';

import usersFromServer from './api/users';
import categoriesFromServer from './api/categories';
import productsFromServer from './api/products';

const SORTABLE_COLUMNS = ['ID', 'Product', 'Category', 'User'];

const products = productsFromServer.map(product => {
  const category = categoriesFromServer.find(
    cat => cat.id === product.categoryId,
  );
  const user = usersFromServer.find(us => us.id === category.ownerId);

  return {
    id: product.id,
    name: product.name,
    category: `${category.icon} - ${category.title}`,
    owner: user.name,
    sex: user.sex,
  };
});

export const App = () => {
  const [visibleProducts] = useState([...products]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [query, setQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortingColumn, setSortingColumn] = useState(null);
  const [sortingOrder, setSortingOrder] = useState(null);

  const handleSorting = newColumn => {
    if (sortingColumn !== newColumn) {
      setSortingColumn(newColumn);
      setSortingOrder('asc');
    } else if (sortingOrder === 'asc') {
      setSortingOrder('desc');
    } else {
      setSortingColumn(null);
      setSortingOrder(null);
    }
  };

  let filteredProducts = visibleProducts
    .filter(product => (selectedUser ? product.owner === selectedUser : true))
    .filter(product =>
      selectedCategories.length > 0
        ? selectedCategories.includes(product.category.split(' - ')[1])
        : true,
    );

  const normalizedQuery = query.trim().toLowerCase();

  if (normalizedQuery) {
    filteredProducts = filteredProducts.filter(product =>
      product.name.toLowerCase().includes(normalizedQuery),
    );
  }

  if (sortingColumn) {
    filteredProducts.sort((a, b) => {
      switch (sortingColumn) {
        case 'ID':
          return a.id - b.id;
        case 'Product':
          return a.name.localeCompare(b.name);
        case 'Category':
          return a.category.localeCompare(b.category);
        case 'User':
          return a.owner.localeCompare(b.owner);
        default:
          throw new Error();
      }
    });

    if (sortingOrder === 'desc') {
      filteredProducts.reverse();
    }
  }

  return (
    <div className="section">
      <div className="container">
        <h1 className="title">Product Categories</h1>

        <div className="block">
          <nav className="panel">
            <p className="panel-heading">Filters</p>

            <p className="panel-tabs has-text-weight-bold">
              <a
                data-cy="FilterAllUsers"
                href="#/"
                onClick={() => setSelectedUser(null)}
                className={selectedUser === null ? 'is-active' : ''}
              >
                All
              </a>

              {usersFromServer.map(user => (
                <a
                  data-cy="FilterUser"
                  href="#/"
                  className={selectedUser === user.name ? 'is-active' : ''}
                  onClick={() => setSelectedUser(user.name)}
                  key={user.id}
                >
                  {user.name}
                </a>
              ))}
            </p>

            <div className="panel-block">
              <p className="control has-icons-left has-icons-right">
                <input
                  data-cy="SearchField"
                  type="text"
                  className="input"
                  placeholder="Search"
                  value={query}
                  onChange={event => setQuery(event.target.value.trimStart())}
                />

                <span className="icon is-left">
                  <i className="fas fa-search" aria-hidden="true" />
                </span>

                <span className="icon is-right">
                  {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                  {query && (
                    <button
                      data-cy="ClearButton"
                      type="button"
                      className="delete"
                      onClick={() => setQuery('')}
                    />
                  )}
                </span>
              </p>
            </div>

            <div className="panel-block is-flex-wrap-wrap">
              <a
                href="#/"
                data-cy="AllCategories"
                className={`button is-success mr-6 ${selectedCategories.length === 0 ? '' : 'is-outlined'}`}
                onClick={() => setSelectedCategories([])}
              >
                All
              </a>

              {categoriesFromServer.map(category => (
                <a
                  data-cy="Category"
                  className={`button mr-2 my-1 ${selectedCategories.includes(category.title) ? 'is-info' : ''}`}
                  href="#/"
                  onClick={() => {
                    if (selectedCategories.includes(category.title)) {
                      setSelectedCategories(
                        selectedCategories.filter(
                          cat => cat !== category.title,
                        ),
                      );
                    } else {
                      setSelectedCategories([
                        ...selectedCategories,
                        category.title,
                      ]);
                    }
                  }}
                  key={category.id}
                >
                  {category.title}
                </a>
              ))}
            </div>

            <div className="panel-block">
              <a
                data-cy="ResetAllButton"
                href="#/"
                className="button is-link is-outlined is-fullwidth"
                onClick={() => {
                  setSelectedCategories([]);
                  setSelectedUser(null);
                  setQuery('');
                }}
              >
                Reset all filters
              </a>
            </div>
          </nav>
        </div>

        <div className="box table-container">
          {filteredProducts.length === 0 ? (
            <p data-cy="NoMatchingMessage">
              No products matching selected criteria
            </p>
          ) : (
            <table
              data-cy="ProductTable"
              className="table is-striped is-narrow is-fullwidth"
            >
              <thead>
                <tr>
                  {SORTABLE_COLUMNS.map(column => (
                    <th key={column} onClick={() => handleSorting(column)}>
                      <span className="is-flex is-flex-wrap-nowrap">
                        {column}
                        <a href="#/">
                          <span className="icon">
                            <i
                              data-cy="SortIcon"
                              className={`fas ${
                                sortingColumn === column
                                  ? sortingOrder === 'asc'
                                    ? 'fa-sort-up'
                                    : sortingOrder === 'desc'
                                      ? 'fa-sort-down'
                                      : 'fa-sort'
                                  : 'fa-sort'
                              }`}
                            />
                          </span>
                        </a>
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map(product => (
                  <tr data-cy="Product" key={product.id}>
                    <td className="has-text-weight-bold" data-cy="ProductId">
                      {product.id}
                    </td>

                    <td data-cy="ProductName">{product.name}</td>
                    <td data-cy="ProductCategory">{product.category}</td>

                    <td
                      data-cy="ProductUser"
                      className={
                        product.sex === 'm'
                          ? 'has-text-link'
                          : 'has-text-danger'
                      }
                    >
                      {product.owner}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
