import Icon from '@/Template/CommonElements/Icon';
import React, { useState, useEffect } from 'react';


export const FilterComponent = ({ filterText, onFilter, onMoreFilters, hasFilters }) => (
	<>
		<div className="d-flex flex-row-reverse">
			{hasFilters &&
			<Icon icon="Filter" 
				id={'filter-table'} 
				tooltip="Filtrar" 
				className="ms-4 me-1 mt-1 text-success pointer"
				size={30}
				onClick={onMoreFilters}
			/>
			}
			<input
				id="search"
				type="text"
				placeholder="Buscar..."
				value={filterText}
				className='form-control'
				onChange={onFilter}
			/>
		</div>
	</>
);