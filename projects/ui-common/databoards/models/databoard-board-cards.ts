import { TemplateRef } from "@angular/core"
import { DataboardBoard } from "./databoard-board"
import { DataboardCard } from "./databoard-card"

export interface DataboardBoardCards extends DataboardBoard {

  // cardTpl?: TemplateRef<any> | undefined | null

  cards?: DataboardCard[] | undefined | null

}
