import { IsNotEmpty, IsNumber } from 'class-validator';

export class InitStatistics {
    @IsNotEmpty()
    @IsNumber()
    targetNumberOfTqvs: number;
}
