package com.ebanking.adminTool.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PagedResponseDto<T> {
    private List<T> data;
    private long totalElements;
    private int totalPages;
    private int currentPage;
    private int pageSize;
    private boolean hasNext;
    private boolean hasPrevious;
    private boolean first;
    private boolean last;
    
    public static <T> PagedResponseDto<T> of(List<T> data, long totalElements, int page, int size) {
        PagedResponseDto<T> response = new PagedResponseDto<>();
        response.setData(data);
        response.setTotalElements(totalElements);
        response.setCurrentPage(page);
        response.setPageSize(size);
        response.setTotalPages((int) Math.ceil((double) totalElements / size));
        response.setHasNext(page < response.getTotalPages() - 1);
        response.setHasPrevious(page > 0);
        response.setFirst(page == 0);
        response.setLast(page >= response.getTotalPages() - 1);
        return response;
    }
}