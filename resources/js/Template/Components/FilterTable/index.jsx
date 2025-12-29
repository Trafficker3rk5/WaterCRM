import React, { useState, useEffect } from 'react';
import { customStyles } from "@/Template/Styles/DataTable";
import DataTable from 'react-data-table-component';
import { FilterComponent } from './FilterComponent';
import { Modal, ModalBody, ModalFooter, ModalHeader, Form} from "reactstrap";
import { Btn } from "../../../Template/AbstractElements";
import FloatingInput from '@/Template/CommonElements/FloatingInput';
import Select from '@/Template/CommonElements/Select';

const FilterTable = (props) => {
    const { dataList, tableColumns, filters } = props;
    const [filterText, setFilterText] = useState('');
	const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
    const [keys, setKeys] = useState([]);
    const [modal, setModal] = useState(false);
    const toggleModal = () => setModal(!modal);
    const [data, setData] = useState({});
    const [isSet, setIsSet] = useState(false);

    const filerData = (item) => {
        for (let key of keys) {
            if (item[key] && String(item[key]).toLowerCase().includes(filterText.toLowerCase())) {
                return true;
            }
        }
    };

    const filteredItems = dataList.filter(
        item => filerData(item),
    );
    
    useEffect(() => {
        setKeys(Object.keys(dataList[0] ? dataList[0] : {}));
        filters && filters.forEach(element => {
            if (element.options){
                element.options.forEach(option => {
                    if (option.selected){
                        setData(data => ({...data, [element.name]: option.value}));
                    }
                });
            }
        });
    } , [dataList]);    

    const subHeaderComponentMemo = React.useMemo(() => {
		const handleClear = () => {
			if (filterText) {
				setResetPaginationToggle(!resetPaginationToggle);
				setFilterText('');
			}
		};
		return (
			<FilterComponent onFilter={e => setFilterText(e.target.value)} onClear={handleClear} filterText={filterText} onMoreFilters={() => toggleModal()} hasFilters={filters && filters.length != 0}/>
		);
	}, [filterText, resetPaginationToggle]);

    const extraFilter = () => {
        toggleModal();
        setResetPaginationToggle(!resetPaginationToggle);
        setFilterText('');
        props.getList(data);
    }

    const resetFilters = () => {
        setData({});
        toggleModal();
        setResetPaginationToggle(!resetPaginationToggle);
        setFilterText('');
        props.getList({});
    }

    const paginationComponentOptions = {
        rowsPerPageText: 'Filas por página',
        rangeSeparatorText: 'de',
        selectAllRowsItem: true,
        selectAllRowsItemText: 'Todos',
    };

    const noDataComponent = <div className='mb-4'>No hay datos para mostrar</div>;

    return (
        <>
            <div className="shadow-sm filter-table" key={'filter-table-shadow'}>
                <DataTable
                    data={filteredItems}
                    columns={tableColumns}
                    center={true}
                    paginationResetDefaultPage={resetPaginationToggle} 
                    pagination
                    highlightOnHover
                    pointerOnHover
                    customStyles={customStyles}
                    subHeader
                    subHeaderComponent={subHeaderComponentMemo}
                    paginationComponentOptions={paginationComponentOptions}
                    noDataComponent={noDataComponent}
                    keyField="id"
                />
            </div>

            <Modal isOpen={modal} toggle={toggleModal} className="mainModal" centered>
                <ModalHeader toggle={toggleModal}>Filtrar</ModalHeader>
                <ModalBody>
                    <Form className='theme-form'>
                        {filters && filters.map((item, index) => (
                            <>
                                {item.type != 'select' &&
                                <FloatingInput 
                                    key={'filter' + index} 
                                    label={{label : item.label}} 
                                    input={{ 
                                        placeholder : item.label, 
                                        onChange : (e) => setData(data => ({...data, [item.name]: e.target.value})),
                                        name : item.name,
                                        value : data[item.name],
                                        type : item.type
                                    }}
                                />
                                }

                                {item.type == 'select' &&
                                <Select 
                                    key={'filter' + index} 
                                    label={{label : item.label}} 
                                    input={{ 
                                        placeholder : item.label, 
                                        onChange : (e) => setData(data => ({...data, [item.name]: e ? e.value : null})),
                                        name : item.name,
                                        options : item.options,
                                        defaultValue : item.options.filter(option => option.value == data[item.name])[0],
                                        isClearable : true
                                    }}
                                    zIndex={2000 - index}
                                />
                                }
                            </>
                        ))}
                    </Form>
                </ModalBody>
                <ModalFooter>
                    <Btn attrBtn={{ color: 'secondary cancel-btn', onClick: resetFilters }} >Resetear</Btn>
                    <Btn attrBtn={{ color: 'primary save-btn', onClick: extraFilter}}>Filtrar</Btn>
                </ModalFooter>
            </Modal>
        </>
    );
};

export default FilterTable;