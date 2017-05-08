var dateModalInfo = '';

function dirtyView() {
	if (filter_data.changed === false) {
		filter_data.changed = true;
		$("[data-toggle=popover]").popover('show');
	}
}

$(document).ready(function() {
	$('#priority').slider({ formater: function (value) { return value.toFixed(2); } }).on('slide', function(ev) {
		dirtyView();

		filter_data.priority_from = ev.value[0].toFixed(2);
		filter_data.priority_to = ev.value[1].toFixed(2);
	});
	$('#pcomplete').slider().on('slide', function(ev) {
		dirtyView();

		filter_data.pcomplete_from = ev.value[0];
		filter_data.pcomplete_to = ev.value[1];
	});
	$('#task_id').change(function() {
		dirtyView();

		filter_data.task_id = $(this).val();
		console.log(filter_data.task_id);
	});

    $('.datepicker').datepicker({
        changeMonth: true,
        changeYear: true,
        dateFormat: "yy-mm-dd"
    });

	$('#dateModal').on('show.bs.modal', function (event) {
		var button = $(event.relatedTarget);
		var info = button.data('info');

		dateModalInfo = info;

		var modal = $(this);
		var from = filter_data[info + '_from'];
		var to = filter_data[info + '_to'];

		if (from) {
			modal.find('.modal-body #date_from').val(from.substring(0, from.indexOf('T')));
			modal.find('.modal-body #time_from').val(from.substring(from.indexOf('T')+1));
		}

		if (to) {
			modal.find('.modal-body #date_to').val(to.substring(0, to.indexOf('T')));
			modal.find('.modal-body #time_to').val(to.substring(to.indexOf('T')+1));
		}
	});

	$('#saveDateModal').click(function() {
		var info = dateModalInfo;
		var modal = $('#dateModal');

		var time_from = modal.find('.modal-body #time_from').val();
		var time_to = modal.find('.modal-body #time_to').val();
		var date_from = modal.find('.modal-body #date_from').val();
		var date_to = modal.find('.modal-body #date_to').val();

		var from = '', to = '';
		if (date_from) {
			from = date_from + 'T' + (time_from || '00:00');
		}
		if (date_to) {
			to = date_to + 'T' + (time_to || '23:59');
		}

		filter_data[info + '_from'] = from;
		filter_data[info + '_to'] = to;

		modal.modal('hide');
		refresh();
	});

	$('.records_per_page').click(function() {
		records_per_page = parseInt($(this).text());

		refresh();
	});

	$('.pagination-tasks-browse').click(function() {
		prepareFilters();
		$(this).attr('href', $(this).attr('href') + "?" + $.param(filter_data));
	})

	$("#btnRefresh").click(function() {
		refresh();
	});

	$("#tasksGrid th[data-sort]").click(function(evt) {
		dirtyView();

		var column = $(this);

		if (!evt.ctrlKey) {
			$("#tasksGrid th[data-sort!=" + column.attr('data-sort') + "]").removeClass('sort-asc sort-desc');
		}

		if (!column.hasClass('sort-asc') && !column.hasClass('sort-desc')) {
			column.addClass('sort-desc');
		} else {
			$(this).toggleClass('sort-asc sort-desc');
		}
	});

	$("#columnsSettings").on("hide.bs.dropdown", function(event) {
		refresh();
	});

	$('#infoModal').on('show.bs.modal', function (event) {
		var button = $(event.relatedTarget);
		var url = button.data('info');

		//var modal = $(this);
		var loadingInfo = $('#loadingInfo').show();
		var taskInfo = $('#taskInfo').hide().text('');

		$.get(url)
			.done(function(data) { displayTaskInfo(taskInfo, data); })
			.fail(function() { taskInfo.text('Error loading data'); })
			.always(function() {loadingInfo.hide(); taskInfo.show();});
	});

  var firstShow = true;
  var filterCount = 0;
  var filterRowModel = null;
  $('.remove-filter-button').click(removeFilterRow);

  function removeFilterRow() {
    if (filterCount === 1) {
      $('.filter-field-name').val(0);
      $('.filter-field-value').val(null)
                              .prop('disabled', true);
    }
    else {
      $(this).parents('.row').remove();
      filterCount -= 1;
    }
  };

  function enableOnChange(event) {
    var row = $(this).parents('.row');
    row.find('.filter-field-value')
       .prop('disabled', false);
    row.find('.filter-field-operator')
       .prop('disabled', false);
  };

  function addFieldFilterRow(fieldName, operator, fieldValue, enabled) {
    fieldName = fieldName || "";
    operator = operator || "";
    fieldValue = fieldValue || "";

    var toAppend = filterRowModel.clone();

    toAppend.find('.filter-field-name')
            .val(fieldName)
            .change(enableOnChange);
    toAppend.find('.filter-field-operator')
            .val(operator)
            .prop('disabled', !enabled);
    toAppend.find('.filter-field-value')
            .val(fieldValue)
            .prop('disabled', !enabled);
    toAppend.find('.remove-filter-button')
            .click(removeFilterRow);

    $('#filterModal .filter-rows').append(toAppend);
    filterCount += 1;
  };

  function createFilterRowModel() {
      $('.filter-field-name').change(enableOnChange);
      var model = $('#filterModal .filter-rows .row').first();

      filterRowModel = model.clone();
      model.remove();
  };

  $('#filterModal').on('show.bs.modal', function(event) {
    if (firstShow) {
      createFilterRowModel();
      addFieldFilterRow();
    }
    if (firstShow && filter_data.filter_by_field) {
      filter_data.filter_by_field.forEach(function(elt) {
        addFieldFilterRow(elt[0], elt[1], elt[2], true);
      });
    }
    firstShow = false;
  });

  $('#saveFilterModal').click(function() {
    var filterRows = $('#filterModal .filter-rows .row');
    filterRows = $.makeArray(filterRows);

    var filters = filterRows.map(function(elt) {
      var elt = $(elt);
      var fieldName = elt.find('.filter-field-name').val();
      var operator = elt.find('.filter-field-operator').val();
      var fieldValue = elt.find('.filter-field-value').val();
      if (fieldName) {
        return [fieldName, operator, fieldValue];
      }
    }).filter(function(elt) {
      return elt;
    });
    filter_data.filter_by_field = filters;

    $('#filterModal').modal('hide');
    refresh();
  });

  $('.add-filter-row-button').click(function(evt) {
    addFieldFilterRow();
  });
});

function displayTaskInfo(taskInfo, data) {
	if (data.length < 1) {
		return;
	}

	var headers = [];
	var info = '<table><thead><tr>';
	// Extract headers
	for (var headerName in data[0].info) {
		headers.push(headerName);
		info += '<th>' + headerName + '</th>'
	}
	info += '</tr></thead><tbody>';
	for (var i = 0; i < data.length; i++) {
		info += '<tr>';
		for (var j = 0; j < headers.length; j++) {
			var headerName = headers[j];
			info += '<td>' + JSON.stringify(data[i].info[headerName]) + '</td>';
		}
		info += '</tr>';
	}
	info += '</tbody></html>';
	taskInfo.html(info);
}

function prepareFilters() {
	filter_data['order_by'] = null;
  var filter_by_field = filter_data['filter_by_field'] || [];
	var order_by = [];
	var display_columns = [];
	var sortColumns = $("#tasksGrid th[data-sort]");
	sortColumns.filter(".sort-asc").each(function() {
		order_by.push($(this).attr('data-sort') + ' asc');
	});
	sortColumns.filter(".sort-desc").each(function() {
		order_by.push($(this).attr('data-sort') + ' desc');
	});

	if (order_by.length > 0) {
		filter_data['order_by'] = order_by.join(',');
	}

	filter_data['display_columns'] = null;
	$("a.columns_settings:has(input:checked)").each(function() {
		display_columns.push($(this).attr('data-value'));
	});

	if (display_columns.length > 0) {
		filter_data['display_columns'] = JSON.stringify(display_columns);
	}

	for(key in filter_data) {
		if(filter_data[key] == null) {
			delete filter_data[key];
		}
	}

  if (filter_by_field.length > 0) {
    filter_data['filter_by_field'] = JSON.stringify(filter_by_field);
  }
}

function refresh() {
	prepareFilters();

	window.location.replace(first_page_url + (!isNaN(records_per_page) ? ("/1/" + records_per_page) : "") + "?" + $.param(filter_data));
}
