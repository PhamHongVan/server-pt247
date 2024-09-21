import db from '../models';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4} from 'uuid';
import matbang from '../../data/matbang.json';
import chothuecanho from '../../data/chothuecanho.json';
import nhachothue from '../../data/nhachothue.json';
import chothuephongtro from '../../data/chothuephongtro.json';
import generateCode from '../ultis/generateCode';
import { formatDate } from '../ultis/dateUltis'; // Đảm bảo đường dẫn đúng
import { dataPrice, dataArea } from '../ultis/data';
import { getNumberFromString,getNumberFromStringV2 } from '../ultis/common';
require('dotenv').config()
const dataBody = [
    {
        body: chothuephongtro.body,
        code: 'CTPT'
    },
    {
        body: matbang.body,
        code: 'MB'
    },
    {
        body: chothuecanho.body,
        code: 'CTCH'
    },
    {
        body: nhachothue.body,
        code: 'NCT'
    },
]

const categories = [
    {
        code : 'CTCH',
        value: 'Cho thuê căn hộ',
        header: 'Cho Thuê Căn Hộ Chung Cư, Giá Rẻ, View Đẹp, Mới Nhất 2024',
        subheader: 'Cho thuê căn hộ - Kênh đăng tin cho thuê căn hộ số 1: giá rẻ, chính chủ, đầy đủ tiện nghi. Cho thuê chung cư với nhiều mức giá, diện tích cho thuê khác nhau.'
    },
    {
        code : 'MB',
        value: 'Mặt bằng',
        header: 'Cho Thuê Mặt Bằng, Giá Rẻ, Chính Chủ, Mới Nhất 2024',
        subheader: 'Cho thuê mặt bằng: giá rẻ, chính chủ, gần chợ, trường học, tiện mở quán ăn, cafe, kinh doanh mọi ngành nghề. Đăng tin cho thuê mặt bằng hiệu quả tại Phongtro247.com'
    },
    {
        code : 'CTPT',
        value: 'Cho thuê phòng trọ',
        header: 'Cho Thuê Phòng Trọ, Giá Rẻ, Tiện Nghi, Mới Nhất 2024',
        subheader: 'Cho thuê phòng trọ - Kênh thông tin số 1 về phòng trọ giá rẻ, phòng trọ sinh viên, phòng trọ cao cấp mới nhất năm 2024. Tất cả nhà trọ cho thuê giá tốt nhất tại Việt Nam.'
    },
    {
        code : 'NCT',
        value: 'Nhà cho thuê',
        header: 'Cho Thuê Nhà Nguyên Căn, Giá Rẻ, Chính Chủ, Mới Nhất 2024',
        subheader: 'Cho thuê nhà nguyên căn, nhà riêng: giá rẻ, chính chủ, đầy đủ tiện nghi. Tìm thuê nhà với nhiều mức giá khác nhau, đa dạng loại diện tích. Đăng tin cho thuê nhà nhanh, hiệu quả tại phongtro247.com'
    },
]


const hashPassword = password => bcrypt.hashSync(password, bcrypt.genSaltSync(12))

export const insertService = () => new Promise(async (resolve, reject) => {
    try {
        const provinceCodes = []
        const labelCodes = []

        await db.Category.bulkCreate(categories)

        dataPrice.forEach(async (item, index) => {
                        await db.Price.create({
                            code: item.code,
                            value: item.value,
                            order: index + 1
                        })
                    })
                    dataArea.forEach(async (item, index) => {
                        await db.Area.create({
                            code: item.code,
                            value: item.value,
                            order: index + 1
                        })
                    })

        dataBody.forEach(cate => {
            cate.body.forEach(async (item) => {
                let postId = uuidv4();
            let labelCode = generateCode(item?.header?.class?.classType).trim();
                labelCodes?.every(item=> item?.code !== labelCode)&&  labelCodes.push({
                    code: labelCode,
                    value: item?.header?.class?.classType?.trim()
                })
                let provinceCode= generateCode(item?.header?.address?.split(',')?.splice(-1)[0]).trim()
                provinceCodes?.every(item=> item?.code !== provinceCode)&&  provinceCodes.push({
                    code: provinceCode,
                    value: item?.header?.address?.split(',')?.splice(-1)[0].trim()
                })
                let attributesId = uuidv4();
                let userId = uuidv4();
                let imagesId = uuidv4();
                let overviewId = uuidv4();
                let currentArea = getNumberFromString(item?.header?.attributes?.acreage)
                let currentPrice = getNumberFromString(item?.header?.attributes?.price)
                      
            await db.Post.create({
                id: postId,
                title: item?.header?.title,
                star: item?.header?.star,
                labelCode,
                address: item?.header?.address,
                attributesId,
                categoryCode: cate.code,
                description: JSON.stringify(item?.mainContent?.content),
                userId,
                overviewId,
                imagesId,
                areaCode : dataArea.find(area => area.max > currentArea  && area.min <= currentArea)?.code,
                priceCode : dataPrice.find(area => area.max > currentPrice  && area.min <= currentPrice)?.code,
                provinceCode,
                areaNumber : getNumberFromStringV2(item?.header?.attributes?.acreage),
                priceNumber: getNumberFromStringV2(item?.header?.attributes?.price),
             });
                            
             await db.Attribute.create({
                 id: attributesId,
                price: item?.header?.attributes?.price,
                acreage: item?.header?.attributes?.acreage,
                published: item?.header?.attributes?.published,
                hashtag: item?.header?.attributes?.hashtag,
            });
                
            await db.Image.create({
                id: imagesId,
                image: JSON.stringify(item?.images)
            });
                
            await db.Overview.create({
                id: overviewId,
                code: item?.overview?.content.find(i => i.name === "Mã tin:")?.content,
                area: item?.overview?.content.find(i => i.name === "Khu vực")?.content,
                type: item?.overview?.content.find(i => i.name === "Loại tin rao:")?.content,
                target: item?.overview?.content.find(i => i.name === "Đối tượng thuê:")?.content,
                bonus: item?.overview?.content.find(i => i.name === "Gói tin:")?.content,
                created: formatDate(item?.overview?.content.find(i => i.name === "Ngày đăng:")?.content),
                expire: formatDate(item?.overview?.content.find(i => i.name === "Ngày hết hạn:")?.content),
             });
                
            await db.User.create({
                 id: userId,
                name: item?.contact?.content.find(i => i.name === "Liên hệ:")?.content,
                password: hashPassword('123456'),
                phone: item?.contact?.content.find(i => i.name === "Điện thoại:")?.content,
                zalo: item?.contact?.content.find(i => i.name === "Zalo")?.content,
             });
         });
                                  
    })
        // console.log(provinceCodes)
         provinceCodes?.forEach(async(item)=>{
        await db.Province.create(item)
         })
         labelCodes?.forEach(async(item)=>{
            await db.Label.create(item)
        })


        resolve('Done.')
    } catch (error) {
        reject(error)
    }
})
// export const createPricesAndAreas = () => new Promise((resolve, reject) => {
//     try {
//         dataPrice.forEach(async (item, index) => {
//             await db.Price.create({
//                 code: item.code,
//                 value: item.value,
//                 order: index + 1
//             })
//         })
//         dataArea.forEach(async (item, index) => {
//             await db.Area.create({
//                 code: item.code,
//                 value: item.value,
//                 order: index + 1
//             })
//         })
//         resolve('OK')
//     } catch (err) {
//         reject(err)
//     }
// })