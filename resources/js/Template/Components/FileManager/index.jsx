import React, { Fragment, useState, useEffect } from 'react';
import { PlusSquare } from 'react-feather';
import { toast } from 'react-toastify';
import { H4, H6, LI, P, UL, Image } from './../../AbstractElements';
import { CardBody, CardHeader, Input, Media } from 'reactstrap';
import { useForm, router } from '@inertiajs/react';


const FileManager = (props) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [myfile, setMyFile] = useState(props.files);
    const [isReadOnly, setIsReadOnly] = useState(props.readOnly || false);

    useEffect(() => {
        
    }, []);

    const handleChange = (event) => {
        event.preventDefault();
        setSearchTerm(event.target.value);
    };

    const deleteFile = (k) => {
        let myfiles = myfile.filter((data, i) => i !== k);
        setMyFile(myfiles);
        props.setFiles(myfiles);
    }

    const changeInput = (e, i) => {
        let myfiles = [...myfile];
        myfiles[i].title = e.target.value;
        setMyFile(myfiles);
        props.setFiles(myfiles);
    }

    const changeSelect = (e, i) => {
        let myfiles = [...myfile];
        myfiles[i].image_type = e.target.value;
        setMyFile(myfiles);
        props.setFiles(myfiles);
    }

    const FileItem = ({ data, index, onDelete, onChangeTitle, onChangeImageType, isReadOnly, id }) => {
        const [imageError, setImageError] = useState(false);
        const [imageLoaded, setImageLoaded] = useState(false);
        const icon = data.type == 'image' ? 'fa fa-file-image-o' : 'fa fa-file-o';
        const imageUrl = data.img || '';
        
        return (
            <LI attrLI={{ className: 'file-box' }} key={index}>
                <a href={data.img} target='_blank' rel="noopener noreferrer">
                    <div 
                        className='file-top' 
                        style={{
                            backgroundImage: data.type == 'image' && imageUrl && !imageError && imageLoaded ? `url('${imageUrl}')` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            minHeight: '150px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            backgroundColor: '#f5f5f5'
                        }}
                    >
                        {data.type == 'image' && imageUrl ? (
                            <img 
                                src={imageUrl} 
                                alt={data.title || data.file}
                                style={{ 
                                    display: 'none'
                                }}
                                onError={() => {
                                    console.error('Image load error:', imageUrl);
                                    setImageError(true);
                                }}
                                onLoad={() => {
                                    setImageLoaded(true);
                                    setImageError(false);
                                }}
                            />
                        ) : null}
                        {(data.type != 'image' || imageError || !imageUrl || !imageLoaded) && (
                            <i className={icon} style={{ fontSize: '48px', color: '#ccc' }}></i>
                        )}
                    </div>
                </a>
                {!isReadOnly && <i className='fa fa-times f-18 remove pointer text-danger' onClick={() => onDelete(index)}></i> }
                <div className='file-bottom'>
                    <H6>{data.file}</H6>
                    <P attrPara={{ className: 'mb-0 mb-1' }}>{formatBytes(data.size)}</P>
                    {!isReadOnly &&
                    <P>
                        <Input placeholder='Titulo' value={data.title} onChange={(e) => onChangeTitle(e, index)}/>
                    </P>
                    }
                    {
                    id == 'images' ?
                    <Input name="select" type="select" value={data.image_type} onChange={(e) => onChangeImageType(e, index)}>
                        <option value='0'>Varios</option>
                        <option value='1'>Principal</option>
                        <option value='2'>Ficha Técnica</option>
                        <option value='3'>Despiece</option>
                        <option value='4'>Vista Lateral</option>
                    </Input> : null
                    } 
                </div>
            </LI>
        );
    };

    const filelist = myfile.filter((data) => {
        if (searchTerm == null) {
            return data;
        } else if (data.file.toLowerCase().includes(searchTerm.toLowerCase())) {
            return data;
        }
    }).map((data, i) => (
        <FileItem 
            key={i}
            data={data}
            index={i}
            onDelete={deleteFile}
            onChangeTitle={changeInput}
            onChangeImageType={changeSelect}
            isReadOnly={isReadOnly}
            id={props.id}
        />
    ));

    const getFile = () => {
        document.getElementById('upfile' + props.id).click();
    };

    const onFileChange = async (e) => {
        const files = e.target.files;
        router.post(props.uploadUrl, {files : files},
            {
                onSuccess: (y) => {
                    console.log(y);
                    let files = y.props.flash.files;
                    if (files && files.length > 0){
                        let myfiles = [...myfile];
                        for (let i = 0; i < files.length; i++) {
                            myfiles.push({
                                id: 0,
                                title: files[i].name,
                                file : files[i].name,
                                size: `${files[i].size}`,
                                img : files[i].url,
                                type : files[i].type,
                                order : myfiles.length + 1 + i
                            });
                        }
                        setMyFile(myfiles);
                        props.setFiles(myfiles);
                        toast.success('Archivo subido correctamente!');
                    }
                },
                onError: (errors) => {
                    console.log(errors);
                }
            }
        )
    };

    function formatBytes(bytes, decimals = 2) {
        if (!+bytes) return '0 Bytes'
    
        const k = 1024
        const dm = decimals < 0 ? 0 : decimals
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']
    
        const i = Math.floor(Math.log(bytes) / Math.log(k))
    
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
    }

    return (
        <Fragment >
            <div className='file-content'>
                <CardHeader style={{ paddingTop : '0px', paddingBottom : '10px' }}>
                    <Media>
                        {props.search != 'hide' ?  
                        <div className='search-file form-inline'>
                            <div className='mb-0 form-group'>
                                <i className='fa fa-search'></i>
                                <input className='form-control-plaintext' type='text' value={searchTerm} onChange={(e) => handleChange(e)} placeholder='Buscar...' />
                            </div>
                        </div>
                        :
                        <H4 attrH4={{ className: 'mb-3' }}>{ props.title }</H4>
                        }
                        <Media body className='text-end'>
                            {!isReadOnly &&
                            <div className='d-inline-flex'>
                                <div className='btn btn-primary' onClick={getFile}>
                                    <PlusSquare />
                                    Agregar
                                </div>
                                <div style={{ height: '0px', width: '0px', overflow: 'hidden' }}>
                                    <Input accept={props.accept} id={'upfile' + props.id} multiple type='file' onChange={(e) => onFileChange(e)} />
                                </div>
                            </div>
                            }
                        </Media>
                    </Media>
                </CardHeader>
                {filelist.length ? (
                    <CardBody className='file-manager'>
                        {props.search != 'hide' && <H4 attrH4={{ className: 'mb-3' }}>{ props.title }</H4> }
                        <UL attrUL={{ className: 'simple-list files' }}> 
                            {filelist}
                        </UL>
                    </CardBody>
                ) : (
                    <H4 attrH4={{ className: 'm-3 text-center' }}>No hay archivos</H4>
                )}
            </div>
        </Fragment>
      );
};

export default FileManager;