/* eslint-disable no-undef */
/* eslint-disable no-use-before-define */

$(() => {
  $('.loader').hide();
  showHideAdvancedSearch();
  applyReadMore();
  highlight();
  setSrcOnModal();
  search();
  suggestionsSearch();
  filterAndSort();
  advancedSearch();
  paginate();
  clearSearchFilters();
});

function paginate() {
  const currentPage = $('.prev').data('page');
  const max = $('.prev').data('max');

  if (currentPage === 1) {
    $('.prev').parent().addClass('disabled');
    $('.prev').attr('aria-disabled', true);
  } else if (currentPage >= max) {
    $('.next').parent().addClass('disabled');
    $('.next').attr('aria-disabled', true);
  } else if (currentPage > 1) {
    $('.prev').parent().removeClass('disabled');
    $('.prev').removeAttr('aria-disabled');
  } else {
    $('.next').parent().removeClass('disabled');
    $('.next').removeAttr('aria-disabled');
  }

  $('.prev').click((event) => {
    event.preventDefault();
    if (currentPage === 1) {
      return false;
    }
    requestServer(currentPage - 1);
  });

  $('.next').click((event) => {
    event.preventDefault();
    if (currentPage >= max) {
      return false;
    }
    requestServer(currentPage + 1);
  });

  $('.page-num').click(function (e) {
    e.preventDefault();
    const page = $(this).text();
    requestServer(page);
    $(this).parent().addClass('active');
  });
}

function showHideAdvancedSearch() {
  // hide advanced search form
  $('.advanced-search-form').hide();
  $('.advanced-search-form').removeAttr('hidden');
  $('.normal-search-link').hide();

  $('.advanced-search-link').click(function (e) {
    e.preventDefault();
    // clear normal form values and hide the normal form
    $('#searchInput').val('');
    $('.search-form').hide();
    $(this).hide();

    // show advanced search form
    $('.normal-search-link').removeAttr('hidden');
    $('.normal-search-link').show();

    $('.advanced-search-form').show(400);
  });

  $('.normal-search-link').click(function (e) {
    e.preventDefault();
    // clear advanced form values and hide the advanced form
    $('#exactPhrase').val('');
    $('#containingWords').val('');
    $(this).hide();
    $('.advanced-search-form').hide();

    // show normal search form
    $('.advanced-search-link').show();
    $('.search-form').show(400);
  });
}

function clearSearchFilters() {
  $('.clear-filters').click((e) => {
    e.preventDefault();
    ['exactPhrase', 'containingWords', 'searchInput', 'category-filter'].forEach((element) => {
      $(`#${element}`).val('');
    });
    $('#sort-filter').val('desc');
    requestServer();
  });
}

function advancedSearch() {
  $('.advanced-search-form').submit((e) => {
    e.preventDefault();
    $('.advanced-search-form').show();
    $('.normal-search-link').show();
    requestServer();
  });
}

function applyReadMore() {
  const maxLength = 300;
  $('.abstract').each(function () {
    let myStr = $(this).text();
    const searchedTerm = $('#searchInput').val().trim();

    if (searchedTerm.length) {
      myStr = highlight(myStr, searchedTerm);
    }

    if ($.trim(myStr).length > maxLength) {
      const newStr = myStr.substring(0, maxLength);
      const removedStr = myStr.substring(maxLength, $.trim(myStr).length);
      $(this).empty().html(newStr);
      $(this).append(
        ' <a href="javascript:void(0);" class="read-more">read more...</a>',
      );
      $(this).append(`<span class="more-text">${removedStr}</span>`);
    }
  });
  $('.read-more').on('click', function () {
    $(this).siblings('.more-text').contents().unwrap();
    $(this).remove();
  });
}

function highlight(string, keyword) {
  const regex = new RegExp(keyword, 'gim');
  if (keyword) {
    $('.publication').each(function () {
      const publication = $(this);
      const title = publication.find('.title');
      const authors = publication.find('.authors');
      const abstract = publication.find('.abstract');

      [title, authors].forEach((element) => {
        const elementText = element.text();
        const markedElement = elementText.replace(regex, (e) => `<mark>${e}</mark>`);
        element.empty().html(markedElement);
      });

      if (!(regex.test(title.text())
        || regex.test(authors.text())
        || regex.test(abstract.text()))) {
        publication.find('.found-in-file').removeAttr('hidden');
      }
    });
  }

  if (string) {
    return string.replace(regex, (e) => `<mark>${e}</mark>`);
  }
}

function search() {
  $('.search-form').submit((e) => {
    e.preventDefault();
    requestServer();
  });
}

function filterAndSort() {
  ['#category-filter', '#sort-filter'].forEach((element) => {
    $(element).change(() => requestServer());
  });
}

function setSrcOnModal() {
  $('.preview-modal').on('show.bs.modal', function (e) {
    const modal = $(this);
    const button = $(e.relatedTarget);
    const src = button.data('src');
    modal.find('iframe').attr('src', src);
  });
}

function suggestionsSearch() {
  $('.suggestion-link').click((e) => {
    e.preventDefault();
    $('#searchInput').val(e.target.innerHTML);
    requestServer(1);
  });
}

function requestServer(page) {
  const category = $('#category-filter').val();
  const sort = $('#sort-filter').val();
  const exact = $('#exactPhrase').val().trim();
  const containing = $('#containingWords').val().trim();
  const searchedTerm = $('#searchInput').val().trim();

  const requestParams = {
    method: 'GET',
    url: `/files/filter?category=${category}&searchTerm=${searchedTerm}&exact=${exact}&containing=${containing}&sort=${sort}&page=${page}`,
  };

  $.ajax({
    ...requestParams,
    beforeSend() {
      $('.loader').show();
      $('.content').hide();
    },
    complete() {
      $('.loader').hide();
      $('.content').show();
    },
    success(result) {
      const element = $('#content');
      if (result.length) {
        element.html(result);
      }
      if (!$('#content')[0].innerHTML.trim().length) {
        element.html('<h5>No Results Found</h5>');
      }
      [exact, containing, searchedTerm].forEach((x) => { if (x.length) highlight(undefined, x); });
      applyReadMore();
      paginate();
      setSrcOnModal();
      suggestionsSearch();
    },
  });
}
