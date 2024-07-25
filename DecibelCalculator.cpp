//Header files
#include <iostream>
#include <cmath>
#include <iomanip>
using namespace std;

int main() {

        double pZero;
        double pOne;
        double db;
        char answer;
        double level;

        cout << "POWER CALCULATIONS" << endl;
        cout << "==================" << endl;

        do {

                //Get power increase from user
                cout << "Sound Power P0: ";
                cin >> pZero;
                cout << "Increased Sound Power P1: ";
                cin >> pOne;
                cout << "============================" << endl;

                //Calculate db level
                db = log10(pOne / pZero);
                db *= 10;
                level = db / 3;

                //Display result
                cout << fixed << showpoint << setprecision(1);
                cout << "A change from " << pZero << " to " << pOne << " corresponds " << db << " dB" << endl;
                cout << "That is, " << level << " level of 3dB " << endl;
                cout << endl;

                cout << "One more time? (Y/N): ";
                cin >> answer;

        } while (answer == 'y' || answer == 'Y');

        return 0;
}

