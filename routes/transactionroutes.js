import express from 'express'
import { getalltransactions, getcumstomertransactiondetails, getpast30daytransactions, getpast90daystransactions, gettodaytransactions } from '../controllers/transactioncontroller.js'

const router=express.Router()

router.get('/transactions/:id',getcumstomertransactiondetails)
router.get('/alltransactions',getalltransactions)
router.get('/todaytransactions',gettodaytransactions)
router.get('/past30daystransactions',getpast30daytransactions)
router.get('/getpast90daystransactions',getpast90daystransactions)


export default router