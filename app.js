document.addEventListener('DOMContentLoaded', function () {
  (function () {
    var DELIMITER = ',';
    var NEWLINE = '\n';
    var qRegex = /^"|"$/g;
    var i = document.getElementById('file');
    var table = document.getElementById('table');
    var pagination = document.getElementById('pagination');
    var basePrice = 50; // Example base price
    var pricePerCreditLine = 5; // Example price per credit line
    var pricePerCreditScorePoint = 2; // Example price per credit score point

    if (!i) {
      return;
    }

    i.addEventListener('change', function () {
      if (!!i.files && i.files.length > 0) {
        parseCSV(i.files[0]);
      }
    });

    function parseCSV(file) {
      if (!file || !FileReader) {
        return;
      }

      var reader = new FileReader();

      reader.onload = function (e) {
        toTable(e.target.result);
      };

      reader.readAsText(file);
    }

    function toTable(text) {
      if (!text || !table) {
        return;
      }

      // Clear table
      while (table.hasChildNodes()) {
        table.removeChild(table.lastChild);
      }

      var rows = text.split(NEWLINE);
      var headers = rows[0].split(DELIMITER); // Extract headers from the first row

      // Add "Subscription Price" to the headers array
      headers.push("Subscription Price");

      var htr = document.createElement('tr');

      headers.forEach(function (h) {
        var th = document.createElement('th');
        var ht = h.trim();

        if (!ht) {
          return;
        }

        th.textContent = ht.replace(qRegex, '');
        htr.appendChild(th);
      });

      // Add a separate header for "Subscription Price"
      var subscriptionPriceHeader = document.createElement('th');
      subscriptionPriceHeader.textContent = "Subscription Price";
      htr.appendChild(subscriptionPriceHeader);

      table.appendChild(htr);

      // Display only 10 rows per page
      var pageSize = 20;
      var currentPage = 1;
      var totalRows = rows.length - 1; // Exclude the header row from the count
      var totalPages = Math.ceil(totalRows / pageSize);

      // Update pagination controls
      updatePagination(totalPages, currentPage, pageSize, rows);

      // Render rows for the current page
      renderPage(currentPage, pageSize, rows);
    }
    function updatePagination(totalPages, currentPage, pageSize, rows) {
      // Clear existing pagination buttons
      pagination.innerHTML = '';

      // Define maximum number of visible page numbers (excluding "...")
      var maxVisiblePageNumbers = 34; // Adjust this value as needed
      console.log("maxVisiblePageNumbers:", maxVisiblePageNumbers);
      console.log("currentPage:", currentPage);
      console.log("totalPages:", totalPages);

      // Calculate starting and ending index for displayed page numbers
      var startIndex, endIndex;
      // Ensure the current page is always visible
      console.log("Before startIndex calculation:", startIndex);
      startIndex = Math.max(1, currentPage - Math.floor(maxVisiblePageNumbers / 2));
      console.log("startIndex:", startIndex);
      console.log("Before endIndex calculation:", endIndex);
      endIndex = Math.min(totalPages, startIndex + maxVisiblePageNumbers - 1);
      console.log("endIndex:", endIndex);

      // Adjust endIndex if there are fewer pages than maxVisiblePageNumbers
      //  if (totalPages < maxVisiblePageNumbers) {
      //     endIndex = totalPages;
      //   }

      // Create and append pagination buttons
      for (var i = startIndex; i <= endIndex; i++) {
        var pageButton = document.createElement('span');
        if (i === 1) {
          pageButton.textContent = "<<"; // Previous button
          // Disable button if on first page
          if (currentPage === 1) {
            pageButton.disabled = true;
            // Add visual cue for disabled button (optional)
            pageButton.classList.add('disabled');
          }
        } else if (i === totalPages) {
          pageButton.textContent = ">>"; // Next button
          // Disable button if on last page
          if (currentPage === totalPages) {
            pageButton.disabled = true;
            // Add visual cue for disabled button (optional)
            pageButton.classList.add('disabled');
          }
        } else {
          pageButton.textContent = i;
        }
        pageButton.className = 'page';
        if (i === currentPage) {
          pageButton.classList.add('active');
        }
        pagination.appendChild(pageButton);

        // Add event listener to pagination button
        pageButton.addEventListener('click', (function (pageNumber, rows) {
          return function () {
            currentPage = pageNumber;
            renderPage(currentPage, pageSize, rows);
          };
        })(i, rows));
      }
    }




    function renderPage(currentPage, pageSize, rows) {
      // Clear existing rows in the table
      table.innerHTML = '';
      var startIndex = (currentPage - 1) * pageSize;
      var endIndex = Math.min(startIndex + pageSize, rows.length);

      for (var i = startIndex; i < endIndex; i++) {
        var rtr;
        var cols = rows[i].split(DELIMITER);

        if (cols.length === 0) {
          continue;
        }

        rtr = document.createElement('tr');

        cols.forEach(function (c) {
          var td = document.createElement('td');
          var tc = c.trim();

          td.textContent = tc.replace(qRegex, '');
          rtr.appendChild(td);
        });

        table.appendChild(rtr);

        // Calculate subscription price based on credit score and credit lines
        if (i > 0) { // Skip header row
          let creditScore = parseFloat(cols[2]); // Assuming credit score is in the second column
          let creditLines = parseInt(cols[3]); // Assuming number of credit lines is in the third column
          var subscriptionPrice = calculateSubscriptionPrice(basePrice, pricePerCreditLine, pricePerCreditScorePoint, creditScore, creditLines);
          console.log("creditScore:", creditScore);
          console.log("creditLines:", creditLines);
          var priceCell = document.createElement('td');
          priceCell.textContent = '₹' + subscriptionPrice.toFixed(2); // Display price with two decimal places
          rtr.appendChild(priceCell);
        }
      }
    }

    function calculateSubscriptionPrice(basePrice, pricePerCreditLine, pricePerCreditScorePoint, creditScore, creditLines) {

      return basePrice + (pricePerCreditLine * creditLines) + (pricePerCreditScorePoint * creditScore);
    }
  })();
});